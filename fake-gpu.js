const fs = require('fs');
const path = require('path');
const { description } = require('./out-node/webgpu/shader/execution/expression/call/builtin/subgroupAdd.spec');
function dumpToFile(ctsString, content, extension, mergeFunction = null) {
  const sanitizeFS = (str) => {
    return str
      .replace(/:/g, '_')
      .replace(/;/g, '_')
      .replace(/=/g, '_')
      .replace(/"/g, '')
      .replace(/'/g, '')
      .replace(/[<>|*?]/g, '_')
      .replace(/\s/g, '');
  };

  let cleanString = ctsString.replace(/^webgpu:shader,/, '');

  const segments = cleanString.split(':');

  let rawFileName = 'index';
  let folderParts = [];

  if (segments.length > 0) {
    rawFileName = segments.pop();

    segments.forEach(segment => {
      const subDirs = segment.split(',');
      folderParts.push(...subDirs);
    });
  }

  const sanitizedDirPath = folderParts.map(p => sanitizeFS(p)).join('/');
  const sanitizedFileName = sanitizeFS(rawFileName) + extension;

  const fullDirPath = `wgsl_dump_output/${sanitizedDirPath}`;
  const fullFilePath = path.join(fullDirPath, sanitizedFileName);

  fs.mkdirSync(fullDirPath, { recursive: true });
  console.log(`PATH IS ${fullFilePath}`);
  console.log(`TESTNAME IS ${ctsString}`);

  if (typeof mergeFunction === 'function' && fs.existsSync(fullFilePath)) {
    let previousContent = fs.readFileSync(fullFilePath, 'utf8');
    const finalContent = mergeFunction(previousContent, content);
    fs.writeFileSync(fullFilePath, finalContent);
  } else {
    fs.writeFileSync(fullFilePath, content);
  }
}

global.GPUBufferUsage = {
  MAP_READ: 0x0001,
  MAP_WRITE: 0x0002,
  COPY_SRC: 0x0004,
  COPY_DST: 0x0008,
  INDEX: 0x0010,
  VERTEX: 0x0020,
  UNIFORM: 0x0040,
  STORAGE: 0x0080,
  INDIRECT: 0x0100,
  QUERY_RESOLVE: 0x0200,
};

global.GPUShaderStage = {
  VERTEX: 0x1,
  FRAGMENT: 0x2,
  COMPUTE: 0x4,
};

global.GPUTextureUsage = {
  COPY_SRC: 0x01,
  COPY_DST: 0x02,
  TEXTURE_BINDING: 0x04,
  STORAGE_BINDING: 0x08,
  RENDER_ATTACHMENT: 0x10,
};

global.GPUMapMode = {
  READ: 0x0001,
  WRITE: 0x0002,
};

GPUAdapterInfo = {
  vendor: "fake",
  architecture: "fake",
  description: "fake",
  subgroupMinSize: 1,
  subgroupMaxSize: 256,
  isFallbackAdapter: false,
},
GPUSupportedLimits = {
    maxTextureDimension1D: 8192,
    maxTextureDimension2D: 8192,
    maxTextureDimension3D:  2048,
    maxTextureArrayLayers: 256,
    maxBindGroups: 4,
    maxBindGroupsPlusVertexBuffers: 24,
    maxBindingsPerBindGroup: 1000,
    maxDynamicUniformBuffersPerPipelineLayout: 8,
    maxDynamicStorageBuffersPerPipelineLayout: 4,
    maxSampledTexturesPerShaderStage: 16,
    maxSamplersPerShaderStage: 16,
    maxStorageBuffersPerShaderStage: 8,
    maxStorageBuffersInVertexStage: 8,
    maxStorageBuffersInFragmentStage: 8,
    maxStorageTexturesPerShaderStage: 4,
    maxStorageTexturesInVertexStage: 4,
    maxStorageTexturesInFragmentStage: 12,
    maxUniformBuffersPerShaderStage: 65536,
    maxUniformBufferBindingSize: 134217728,
    maxStorageBufferBindingSize: 256,
    minUniformBufferOffsetAlignment: 8,
    minStorageBufferOffsetAlignment: 268435456,
    maxVertexBuffers: 16,
    maxBufferSize: 2048,
    maxVertexAttributes: 16, 
    maxVertexBufferArrayStride: 2048,
    maxInterStageShaderVariables: 16,
    maxColorAttachments: 8,
    maxColorAttachmentBytesPerSample: 32,
    maxComputeWorkgroupStorageSize: 16384,
    maxComputeInvocationsPerWorkgroup: 256,
    maxComputeWorkgroupSizeX: 256,
    maxComputeWorkgroupSizeY: 256,
    maxComputeWorkgroupSizeZ: 256,
    maxComputeWorkgroupsPerDimension: 65535,
}

global.GPUQueue = {
  submit: () => {},
  onSubmittedWorkDone: async () => {},
  writeBuffer: () => {},
  writeTexture: (a,b,c,d) => {},
  copyExternalImageToTexture: () => {},
}

global.GPUAdapter = class {};
global.GPUDevice = class { destroy() {} };
global.GPUBuffer = class { destroy() {} };
global.GPUCommandBuffer = class {};
global.GPUCommandEncoder = class {};
global.GPUTexture = class {};
global.GPUExternalTexture = class {};
global.GPUTextureView = class {};
global.GPUSampler = class {};
global.GPUBindGroupLayout = class {};
global.GPUPipelineLayout = class {};
global.GPUBindGroup = class {};
global.GPUShaderModule = class {};
global.GPUComputePipeline = class {};
global.GPURenderPipeline = class {};
global.GPUQuerySet = class {};
global.GPUValidationError = class extends Error {};
global.GPUOutOfMemoryError = class extends Error {};
global.GPUInternalError = class extends Error {};

class GPU {
  constructor() {
    this.wgslLanguageFeatures = {
      proto: Set.prototype,
      size: 0,
      has: (x) => {return true}
    };
  }
}

function makeNative(func, name) {
  func.toString = function() {
    return `function ${name}() { [native code] }`;
  };
  return func;
}

GPU.prototype.requestAdapter = makeNative(async function requestAdapter() {
  return {
    features: new Set(),
    limits: GPUSupportedLimits,
    queue: GPUQueue,
    requestDevice: async () => {
      let resolveLost;
      const lostPromise = new Promise((resolve) => { resolveLost = resolve; });
      let testName;
      let testOccurences = new Map();

      return {
        adapterInfo: GPUAdapterInfo,
        limits: GPUSupportedLimits,
        queue: GPUQueue,
        destroy: () => {
            resolveLost({ reason: 'destroyed', message: 'Device destroyed' });
        },

        features: {
          has: (x) => {return true}
        },

        setTestName: (x) => { testName = x; },

        dumpToFile: (ctsString, content, extension) => {
          dumpToFile(ctsString, content, extension)
        },

        lost: lostPromise,

        popErrorScope: async () => null,
        pushErrorScope: (x) => {},

        createBuffer: (descriptor) => {
            const size = descriptor.size || 0;
            const buffer = new ArrayBuffer(size);

            return {
                destroy: () => {},
                mapAsync: async () => {},
                getMappedRange: (offset, rangeSize) => {
                    return buffer;
                },
                unmap() {
                  if (!!descriptor.mappedAtCreation) {
                    this.data = new Uint8Array(buffer);
                  }
                },
                size: size,
                usage: descriptor.usage || 0,
                data: null
            };
        },

        createTexture: (descriptor) => {
          return {
            width: descriptor.size.width || descriptor.size[0],
            height: descriptor.size.height || descriptor.size[1] || 1,
            depthOrArrayLayers: descriptor.size.depthOrArrayLayers || descriptor.size[2] || 1,
            mipLevelCount: descriptor.mipLevelCount || 1,
            sampleCount: descriptor.sampleCount || 1, 
            dimension: descriptor.dimension || "2d",
            format: descriptor.format,
            usage: descriptor.usage,
            createView: (view_descriptor) => {
            }
        };},

        createSampler: (descriptor) => {
          return {
            descriptor: descriptor,
          }
        },

        createShaderModule: (descriptor) => {
            testOccurences[testName] = (testOccurences[testName] || 0) + 1;
            dumpToFile(testName, descriptor.code, '.wgsl');
            return {
                getCompilationInfo: async () => ({ messages: [] })
            }
        },
        
        createComputePipeline: (descriptor) => {
            const pipeline = new global.GPUComputePipeline();
            pipeline.getBindGroupLayout = (index) => new global.GPUBindGroupLayout();
            return pipeline;
        },

        createComputePipelineAsync: async (descriptor) => {
            const pipeline = new global.GPUComputePipeline();
            pipeline.getBindGroupLayout = (index) => new global.GPUBindGroupLayout();
            return pipeline;
        },

        createBindGroupLayout: () => new global.GPUBindGroupLayout(),
        createPipelineLayout: () => new global.GPUPipelineLayout(),
        createBindGroup: (x) => {
          for (const entry of x.entries) {
            if (!!entry.resource && !!entry.resource.buffer && entry.resource.buffer.data !== null) {
              const extension = testOccurences[testName] == 1 ? '.in.json' : `.in${testOccurences[testName]}.json`;
              dumpToFile(testName, `{"0:${entry.binding}": [${entry.resource.buffer.data.join(', ')}]}`, extension,
                (prev, cur) => { return "{" + prev.substring(1, prev.length-1) + ", " + cur.substring(1, cur.length-1) + "}"; }
              );
            }
          }
          return new global.GPUBindGroupLayout();
        },
        createCommandEncoder: () => ({
            finish: () => ({}),
            beginComputePass: () => ({
                setPipeline: () => {},
                setBindGroup: () => {},
                dispatchWorkgroups: () => {},
                end: () => {},
            }),
            copyBufferToBuffer: () => {},
            copyBufferToTexture: () => {},
        }),
        createRenderPipeline: () => {
          return {
            getBindGroupLayout: (index) => {}
          }
        }
      };
    },
  };
}, 'requestAdapter');

GPU.prototype.getPreferredCanvasFormat = makeNative(function getPreferredCanvasFormat() {
  return 'bgra8unorm';
}, 'getPreferredCanvasFormat');

function create(flags) {
  return new GPU();
}

const navigator = {
  gpu: new GPU()
};

module.exports = {
  create: create,
  navigator,
};
