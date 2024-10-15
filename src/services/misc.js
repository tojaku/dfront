
export function FormDataNormalize(formData) {
    // custom field processing
    const data = {};
    for (let field of formData) {
        const [key, value] = field;
        // skip files if empty
        if (value instanceof File && value.size === 0) {
            /* data[key] = null; */
            continue;
        }
        // optional: skip empty string values
        /*
        if (!value || value === "") {
            continue;
        }
        */
        // gather multiple values under same key into array
        const keys = Object.keys(data);
        if (keys.includes(key)) {
            // data already contains key
            if (Array.isArray(data[key])) {
                // value at current key is array, so push value in
                data[key].push(value);
            } else {
                // value at current key is basic value, so create array and add both old and new values
                data[key] = [data[key], value];
            }
        } else {
            // data does not contain key, add as basic value
            data[key] = value;
        }
    }

    return data;
}

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}