import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

// Test the actual middleware, controller, service and repository without a live
// PostgreSQL server. Stub Prisma and express-validator at the import boundary.
const source = (relative) => readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8');

function makeChain() {
  const chain = new Proxy({}, { get: () => () => chain });
  return chain;
}
const validatorsMock = new vm.SyntheticModule(
  ['body', 'oneOf', 'param', 'validationResult'],
  function () {
    this.setExport('body', makeChain);
    this.setExport('oneOf', makeChain);
    this.setExport('param', makeChain);
    this.setExport('validationResult', () => ({ isEmpty: () => true }));
  },
);
const validatorsModule = new vm.SourceTextModule(source('src/middleware/validators.js'));
await validatorsModule.link(async (specifier) => {
  assert.equal(specifier, 'express-validator');
  return validatorsMock;
});
await validatorsModule.evaluate();
const validate = validatorsModule.namespace.validateCompletedFilter;

const records = [
  { id: 1, userId: 2, title: 'Task 1', completed: true },
  { id: 2, userId: 2, title: 'Task 2', completed: false },
  { id: 3, userId: 2, title: 'Task 3', completed: false },
  { id: 4, userId: 99, title: 'Other user', completed: true },
];
const queryCalls = [];
const fakePrisma = {
  task: {
    async findMany({ where }) {
      queryCalls.push(where);
      return records.filter((task) =>
        task.userId === where.userId &&
        (where.completed === undefined || task.completed === where.completed));
    },
  },
};
const prismaMock = new vm.SyntheticModule(['default'], function () {
  this.setExport('default', fakePrisma);
});
const repositoryModule = new vm.SourceTextModule(source('src/repositories/taskRepo.js'));
const serviceModule = new vm.SourceTextModule(source('src/services/taskService.js'));
const controllerModule = new vm.SourceTextModule(source('src/controllers/taskController.js'));
await controllerModule.link(async (specifier) => {
  if (specifier.endsWith('/services/taskService.js')) return serviceModule;
  if (specifier.endsWith('/repositories/taskRepo.js')) return repositoryModule;
  if (specifier.endsWith('/config/db.js')) return prismaMock;
  throw new Error(`Unknown import: ${specifier}`);
});
await controllerModule.evaluate();

async function request(query, userId = 2) {
  let nextCalled = false;
  const req = { query, user: { id: userId } };
  const res = {
    statusCode: 200,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.payload = value; return this; },
  };
  validate(req, res, () => { nextCalled = true; });
  if (nextCalled) await controllerModule.namespace.getMyTasksHandler(req, res);
  return { status: res.statusCode, body: res.payload, nextCalled };
}

test('no completed parameter returns all and only the authenticated user tasks', async () => {
  const result = await request({});
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.map((t) => t.id), [1, 2, 3]);
  assert.deepEqual(queryCalls.at(-1), { userId: 2 });
});

test('true filters completed tasks with boolean true, still scoped to user', async () => {
  const result = await request({ completed: 'true' });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.map((t) => t.id), [1]);
  assert.deepEqual(queryCalls.at(-1), { userId: 2, completed: true });
});

test('false filters incomplete tasks with boolean false (not truthy string)', async () => {
  const result = await request({ completed: 'false' });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.map((t) => t.id), [2, 3]);
  assert.deepEqual(queryCalls.at(-1), { userId: 2, completed: false });
});

for (const bad of ['invalid', '', 'yes', '1', 'True', 'FALSE', null, true, ['true', 'false']]) {
  test(`invalid completed query ${JSON.stringify(bad)} returns 400 without querying DB`, async () => {
    const initialCalls = queryCalls.length;
    const result = await request({ completed: bad });
    assert.equal(result.status, 400);
    assert.equal(result.nextCalled, false);
    assert.deepEqual(result.body, { errors: ['completed must be true or false'] });
    assert.equal(queryCalls.length, initialCalls);
  });
}

test('filter respects different logged-in user and does not leak other tasks', async () => {
  const result = await request({ completed: 'true' }, 99);
  assert.deepEqual(result.body.map((t) => t.id), [4]);
  assert.deepEqual(queryCalls.at(-1), { userId: 99, completed: true });
});
