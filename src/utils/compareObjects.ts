export default function compareObjects(object1:any, object2:any, strict = false) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (strict && keys1.length !== keys2.length) {
        return false;
    }
    
    for (let key of keys1) {
        if(strict && !object2[key]) continue;
        if (object1[key] !== object2[key]) {
            return false;
        }
    }
    return true;
  }