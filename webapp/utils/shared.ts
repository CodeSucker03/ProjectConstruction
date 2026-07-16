export const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

export const noop = () => {}; // No operation function, does nothing

export const downloadFileShared = (sPath : string): void =>{
  const Anchor = document.createElement("a");
  Anchor.href = sPath;
  document.body.appendChild(Anchor);
  Anchor.click();
  document.body.removeChild(Anchor);
};


 