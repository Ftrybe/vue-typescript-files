const ithis = this;
export const promisify = (f: Function) => (...params: any[]) => {
  return new Promise<any>( function(resolve, reject){
    f.apply(ithis, [...params, (err: Error, data: any) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    }]);
  });
};

