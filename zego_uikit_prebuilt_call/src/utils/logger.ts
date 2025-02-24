const TAG = 'ZEGOUIKitPrebuiltCall'

export const zploginfo = (...msg: any[]) => {
  console.log(`${TAG}[INFO]: `, ...msg);
};
export const zplogwarning = (...msg: any[]) => {
  console.warn(`${TAG}[WARN]: `, ...msg);
};

export const zplogerror = (...msg: any[]) => {
  console.error(`${TAG}[ERROR]: `, ...msg);
};
