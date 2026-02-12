const fs = require('fs');
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

  const parts = cleanString.split(',');

  const lastSegment = parts.pop();

  if (!lastSegment) {
    throw new Error("Invalid format: String is empty or missing parts.");
  }

  const firstColonIndex = lastSegment.indexOf(':');
  
  let finalFolderPart = lastSegment;
  let rawFileName = 'index';

  if (firstColonIndex !== -1) {
    finalFolderPart = lastSegment.substring(0, firstColonIndex);
    rawFileName = lastSegment.substring(firstColonIndex + 1);
  }

  parts.push(finalFolderPart);

  const sanitizedDirPath = parts.map(p => sanitizeFS(p)).join('/');
  
  const sanitizedFileName = sanitizeFS(rawFileName) + extension;

  const fullDirPath = `wgsl_dump_output/${sanitizedDirPath}`;
  const fullFilePath = `${fullDirPath}/${sanitizedFileName}`;

  fs.mkdirSync(fullDirPath, { recursive: true });
  console.log(`PATH IS ${fullFilePath}`);
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
    requestDevice: async () => {
      let resolveLost;
      const lostPromise = new Promise((resolve) => { resolveLost = resolve; });
      let testName;

      return {
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
            console.log(descriptor)

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

        createShaderModule: (descriptor) => {
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
          console.log("dupa", x.entries);
          for (const entry of x.entries) {
            if (entry.resource.buffer.data !== null) {
              dumpToFile(testName, `{"0:${entry.binding}": [${entry.resource.buffer.data.join(', ')}]}`, '.in.json',
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
