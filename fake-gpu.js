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

global.GPUAdapter = class {};
global.GPUDevice = class { destroy() {} };
global.GPUBuffer = class { destroy() {} };
global.GPUQueue = class {};
global.GPUCommandBuffer = class {};
global.GPUCommandEncoder = class {};
global.GPUTexture = class {};
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
      size: 0
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
    requestDevice: async () => {
      let resolveLost;
      const lostPromise = new Promise((resolve) => { resolveLost = resolve; });

      return {
        destroy: () => {
            resolveLost({ reason: 'destroyed', message: 'Device destroyed' });
        },

        features: {
          has: (x) => {return true}
        },

        lost: lostPromise,

        queue: {
            submit: () => {},
            writeBuffer: () => {},
            copyExternalImageToTexture: () => {},
            onSubmittedWorkDone: async () => {},
        },

        popErrorScope: async () => null,
        pushErrorScope: (x) => {},
        
        limits: {
            maxComputeWorkgroupStorageSize: 16384,
            maxComputeInvocationsPerWorkgroup: 256,
            maxComputeWorkgroupSizeX: 256,
            maxComputeWorkgroupSizeY: 256,
            maxComputeWorkgroupSizeZ: 64,
            maxStorageBufferBindingSize: 134217728,
            maxBufferSize: 268435456,
        },

        createBuffer: (descriptor) => {
            const size = descriptor.size || 0;
            const buffer = new ArrayBuffer(size);

            return {
                destroy: () => {},
                mapAsync: async () => {},
                getMappedRange: (offset, rangeSize) => {
                    return buffer;
                },
                unmap: () => {},
                size: size,
                usage: descriptor.usage || 0,
            };
        },

        createShaderModule: (descriptor) => {
            // console.log("--- SHADER DUMP ---");
            // console.log(descriptor.code); 
            // console.log("-------------------");
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
        createBindGroup: () => {},
        createCommandEncoder: () => ({
            finish: () => ({}),
            beginComputePass: () => ({
                setPipeline: () => {},
                setBindGroup: () => {},
                dispatchWorkgroups: () => {},
                end: () => {},
            }),
            copyBufferToBuffer: () => {},
        }),
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