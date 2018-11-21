const fs = require('fs');
const upath = require('upath');
const cargo = require('../../../lib/manager/cargo/artifacts');
const { extractPackageFile } = require('../../../lib/manager/cargo/extract');

const crateDir = 'test/_fixtures/cargo/example_crate';
const cargoTomlFilePath = upath.join(crateDir, 'Cargo.toml');
const cargoLockFilePath = upath.join(crateDir, 'Cargo.lock');
const cargoToml = fs.readFileSync(cargoTomlFilePath, 'utf8');
// const cargoLock = fs.readFileSync(cargoLockFilePath, 'utf8');
let config;

describe('cargo.getArtifacts()', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    config = {
      localDir: crateDir,
    };
  });
  it('returns null by default', async () => {
    expect(await cargo.getArtifacts('Cargo.toml', [], '', config)).toBeNull();
  });
  it('catches errors', async () => {
    // NOTE: In this case cargo.getArtifacts() returns null, because
    // updatedDeps array is empty
    expect(await cargo.getArtifacts()).toBeNull();
    // expect(await cargo.getArtifacts()).toMatchSnapshot();
  });
  it('generates Cargo.lock', async () => {
    const updatedDeps = extractPackageFile(cargoToml, 'Cargo.toml').deps;
    expect(
      await cargo.getArtifacts('Cargo.toml', updatedDeps, cargoToml, config)
    ).toMatchSnapshot();
    fs.unlinkSync(cargoLockFilePath);
  });
});
