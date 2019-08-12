const newLocal = this;
export const promisify = (f: Function) => (...params: any[]) => {
  return new Promise<any>( function(resolve, reject){
    f.apply(newLocal, [...params, (err: Error, data: any) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    }]);
  });
};

