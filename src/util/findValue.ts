export default function findValue(args:object, obj:object) {
    for (let [key_arg, value_arg] of Object.entries(args)) {
        for (let [key, value] of Object.entries(obj)) {
            if (key_arg == key && value_arg == value) {
                return obj;
            }
        }
    }
}
