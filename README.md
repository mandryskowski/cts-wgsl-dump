# WebGPU CTS shader dump

This fork runs the WebGPU CTS with a simple fake WebGPU implementation with the goal to dump most of the test suite's shaders, in particular:
- Their source code (in WGSL)
- The input buffer intended to be passed to the shader, if specified in the test case
- The expected output buffer of the shader, only if simple concrete comparators are used in the test case (see https://github.com/mandryskowski/cts-wgsl-dump/issues/4)

We focus on the WGSL part of the CTS, which is `webgpu:shader,*`.

This fork is
1. **hacky** - the aim is _not_ to add the WGSL dump feature to the CTS, just make it work with a small amount of code to reduce the maintenance burden. 
2. **lightweight** - it uses a fake WebGPU implementation, to avoid the need to build a real one (like dawn or wgpu). This fake implementation just needs to make the CTS happy up to the point where we can dump the shaders.
