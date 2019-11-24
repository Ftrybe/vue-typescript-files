export default class Promisify {

  public static apply(f: Function){
    return (...params: any[]) => {
      return new Promise<any>(function (resolve, reject) {
        f.apply(f, [...params, (err: Error, data: any) => {
          if (err) {
            reject(err);
          }
          resolve(data);
        }])
      })
    }
  }
}

