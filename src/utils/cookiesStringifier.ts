export default function cookiesStringifier(...args: any) {
    var text_formed:string = "";
    for(let arg in args) {
        text_formed = text_formed + arg + ";";
    }
    return text_formed;
}