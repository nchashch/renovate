const fs = require('fs');
const { extractPackageFile } = require('../../../lib/manager/homebrew/extract');

const aalib = fs.readFileSync(
  'test/manager/homebrew/_fixtures/aalib.rb',
  'utf8'
);
const aap = fs.readFileSync('test/manager/homebrew/_fixtures/aap.rb', 'utf8');
const acmetool = fs.readFileSync(
  'test/manager/homebrew/_fixtures/acmetool.rb',
  'utf8'
);
const aide = fs.readFileSync('test/manager/homebrew/_fixtures/aide.rb', 'utf8');
const ibazel = fs.readFileSync(
  'test/manager/homebrew/_fixtures/ibazel.rb',
  'utf8'
);

describe('lib/manager/homebrew/extract', () => {
  describe('extractPackageFile()', () => {
    it('skips sourceforge dependency', () => {
      expect(extractPackageFile(aalib)).not.toBeNull();
      expect(extractPackageFile(aalib).deps[0].skipReason).toBe(
        'unsupported-url'
      );
      expect(extractPackageFile(aalib)).toMatchSnapshot();
    });
    it('skips sourceforge dependency', () => {
      expect(extractPackageFile(aap)).not.toBeNull();
      expect(extractPackageFile(aap).deps[0].skipReason).toBe(
        'unsupported-url'
      );
      expect(extractPackageFile(aap)).toMatchSnapshot();
    });
    it('skips github dependency with wrong format', () => {
      expect(extractPackageFile(acmetool)).not.toBeNull();
      expect(extractPackageFile(acmetool).deps[0].skipReason).toBe(
        'unsupported-url'
      );
      expect(extractPackageFile(acmetool)).toMatchSnapshot();
    });
    it('extracts "releases" github dependency', () => {
      expect(extractPackageFile(aide)).not.toBeNull();
      expect(extractPackageFile(aide).deps[0].skipReason).toBeUndefined();
      expect(extractPackageFile(aide)).toMatchSnapshot();
    });
    it('extracts "archive" github dependency', () => {
      expect(extractPackageFile(ibazel)).not.toBeNull();
      expect(extractPackageFile(ibazel).deps[0].skipReason).toBeUndefined();
      expect(extractPackageFile(ibazel)).toMatchSnapshot();
    });
    it('handles no space before class header', () => {
      const content = `class Ibazel < Formula
          desc 'IBazel is a tool for building Bazel targets when source files change.'
          homepage 'https://github.com/bazelbuild/bazel-watcher'
          url "https://github.com/bazelbuild/bazel-watcher/archive/v0.8.2.tar.gz"
          sha256 '26f5125218fad2741d3caf937b02296d803900e5f153f5b1f733f15391b9f9b4'
          end
      `;
      expect(extractPackageFile(content)).not.toBeNull();
      expect(extractPackageFile(content).deps[0].skipReason).toBeUndefined();
      expect(extractPackageFile(content)).toMatchSnapshot();
    });
    it('returns null for invalid class header', () => {
      const content = `
          class Ibazel !?# Formula
          desc 'IBazel is a tool for building Bazel targets when source files change.'
          homepage 'https://github.com/bazelbuild/bazel-watcher'
          url "https://github.com/bazelbuild/bazel-watcher/archive/v0.8.2.tar.gz"
          sha256 '26f5125218fad2741d3caf937b02296d803900e5f153f5b1f733f15391b9f9b4'
          end
      `;
      expect(extractPackageFile(content)).toBeNull();
    });
    it('returns null for invalid class header', () => {
      const content = `
          class Ibazel < NotFormula
          desc 'IBazel is a tool for building Bazel targets when source files change.'
          homepage 'https://github.com/bazelbuild/bazel-watcher'
          url "https://github.com/bazelbuild/bazel-watcher/archive/v0.8.2.tar.gz"
          sha256 '26f5125218fad2741d3caf937b02296d803900e5f153f5b1f733f15391b9f9b4'
          end
      `;
      expect(extractPackageFile(content)).toBeNull();
    });
    it('skips if there is no url field', () => {
      const content = `
          class Ibazel < Formula
          desc 'IBazel is a tool for building Bazel targets when source files change.'
          homepage 'https://github.com/bazelbuild/bazel-watcher'
          not_url "https://github.com/bazelbuild/bazel-watcher/archive/v0.8.2.tar.gz"
          sha256 '26f5125218fad2741d3caf937b02296d803900e5f153f5b1f733f15391b9f9b4'
          end
      `;
      expect(extractPackageFile(content)).not.toBeNull();
      expect(extractPackageFile(content).deps[0].skipReason).toBe(
        'unsupported-url'
      );
      expect(extractPackageFile(content)).toMatchSnapshot();
    });
    it('skips if invalid url field', () => {
      const content = `
          class Ibazel < Formula
          desc 'IBazel is a tool for building Bazel targets when source files change.'
          homepage 'https://github.com/bazelbuild/bazel-watcher'
          url "https://github.com/bazelbuild/bazel-watcher/archive/v0.8.2.not_tar.not_gz"
          sha256 '26f5125218fad2741d3caf937b02296d803900e5f153f5b1f733f15391b9f9b4'
          end
      `;
      expect(extractPackageFile(content)).not.toBeNull();
      expect(extractPackageFile(content).deps[0].skipReason).toBe(
        'unsupported-url'
      );
      expect(extractPackageFile(content)).toMatchSnapshot();
    });
    it('skips if invalid url field', () => {
      const content = `
          class Ibazel < Formula
          desc 'IBazel is a tool for building Bazel targets when source files change.'
          homepage 'https://github.com/bazelbuild/bazel-watcher'
          url "https://github.com/bazelbuild/bazel-watcher/archive/vInvalid.version.2.tar.gz"
          sha256 '26f5125218fad2741d3caf937b02296d803900e5f153f5b1f733f15391b9f9b4'
          end
      `;
      expect(extractPackageFile(content)).not.toBeNull();
      expect(extractPackageFile(content).deps[0].skipReason).toBe(
        'unsupported-url'
      );
      expect(extractPackageFile(content)).toMatchSnapshot();
    });
    it('skips if invalid url field', () => {
      const content = `
          class Ibazel < Formula
          desc 'IBazel is a tool for building Bazel targets when source files change.'
          homepage 'https://github.com/bazelbuild/bazel-watcher'
          url ??https://github.com/bazelbuild/bazel-watcher/archive/v0.8.2.tar.gz"
          sha256 '26f5125218fad2741d3caf937b02296d803900e5f153f5b1f733f15391b9f9b4'
          end
      `;
      expect(extractPackageFile(content)).not.toBeNull();
      expect(extractPackageFile(content).deps[0].skipReason).toBe(
        'unsupported-url'
      );
      expect(extractPackageFile(content)).toMatchSnapshot();
    });
    it('skips if there is no sha256 field', () => {
      const content = `
          class Ibazel < Formula
          desc 'IBazel is a tool for building Bazel targets when source files change.'
          homepage 'https://github.com/bazelbuild/bazel-watcher'
          url "https://github.com/bazelbuild/bazel-watcher/archive/v0.8.2.tar.gz"
          not_sha256 '26f5125218fad2741d3caf937b02296d803900e5f153f5b1f733f15391b9f9b4'
          end
      `;
      expect(extractPackageFile(content)).not.toBeNull();
      expect(extractPackageFile(content).deps[0].skipReason).toBe(
        'invalid-sha256'
      );
      expect(extractPackageFile(content)).toMatchSnapshot();
    });
    it('skips if sha256 field is invalid', () => {
      const content = `
          class Ibazel < Formula
          desc 'IBazel is a tool for building Bazel targets when source files change.'
          homepage 'https://github.com/bazelbuild/bazel-watcher'
          url "https://github.com/bazelbuild/bazel-watcher/archive/v0.8.2.tar.gz"
          sha256 '26f5125218fad2741d3caf937b0229'
          end
      `;
      expect(extractPackageFile(content)).not.toBeNull();
      expect(extractPackageFile(content).deps[0].skipReason).toBe(
        'invalid-sha256'
      );
      expect(extractPackageFile(content)).toMatchSnapshot();
    });
  });
});
