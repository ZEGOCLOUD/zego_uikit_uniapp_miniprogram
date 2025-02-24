const TAG = 'ZEGOUIKit'

export const zloginfo = (...msg: any[]) => {
  console.log(`${TAG}[INFO]: `, ...msg);
};
export const zlogwarning = (...msg: any[]) => {
  console.warn(`${TAG}[WARN]: `, ...msg);
};

export const zlogerror = (...msg: any[]) => {
  console.error(`${TAG}[ERROR]: `, ...msg);
};
