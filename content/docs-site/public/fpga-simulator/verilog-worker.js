import {runBoard} from './wasm-verilog.js';

self.onmessage=async event=>{
  const {source,inputs}=event.data;
  try{
    const result=await runBoard(source,inputs,message=>self.postMessage({type:'progress',message}));
    const transfer=result.frameData?[result.frameData.buffer]:[];
    self.postMessage({type:'result',result},transfer);
  }catch(error){
    self.postMessage({type:'error',message:error instanceof Error?error.message:String(error)});
  }
};
