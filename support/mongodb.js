var tableStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var table = tableStr.split("");


function atob(base64) {
    if (/(=[^=]+|={3,})$/.test(base64)) throw new Error("String contains an invalid character");
    base64 = base64.replace(/=/g, "");
    var n = base64.length & 3;
    if (n === 1) throw new Error("String contains an invalid character");
    for (var i = 0, j = 0, len = base64.length / 4, bin = []; i < len; ++i) {
        var a = tableStr.indexOf(base64[j++] || "A"), b = tableStr.indexOf(base64[j++] || "A");
        var c = tableStr.indexOf(base64[j++] || "A"), d = tableStr.indexOf(base64[j++] || "A");
        if ((a | b | c | d) < 0) throw new Error("String contains an invalid character");
        bin[bin.length] = ((a << 2) | (b >> 4)) & 255;
        bin[bin.length] = ((b << 4) | (c >> 2)) & 255;
        bin[bin.length] = ((c << 6) | d) & 255;
    };
    return String.fromCharCode.apply(null, bin).substr(0, bin.length + n - 4);
};

function btoa(bin) {
    for (var i = 0, j = 0, len = bin.length / 3, base64 = []; i < len; ++i) {
        var a = bin.charCodeAt(j++), b = bin.charCodeAt(j++), c = bin.charCodeAt(j++);
        if ((a | b | c) > 255) throw new Error("String contains an invalid character");
        base64[base64.length] = table[a >> 2] + table[((a << 4) & 63) | (b >> 4)] +
            (isNaN(b) ? "=" : table[((b << 2) & 63) | (c >> 6)]) +
            (isNaN(b + c) ? "=" : table[c & 63]);
    }
    return base64.join("");
};

function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null,
                str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
            );
}

function base64ToHex(str) {
    for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
        var tmp = bin.charCodeAt(i).toString(16);
        if (tmp.length === 1) tmp = "0" + tmp;
        hex[hex.length] = tmp;
    }
    return hex.join(" ");
}

function endian(hashstr) {
    hashstr = hashstr.replace(/^(.(..)*)$/, "0$1"); // Add a leading 0 if needed
    var a = hashstr.match(/../g); // split into groups of 2
    a.reverse();
    return a.join("");
}

function get_block(hashstr) { 
    return db.blocks.find({"hash":new BinData(0, hexToBase64(endian(hashstr)))}); 
}

function get_tx(hashstr) { 
    return db.transactions.find({"hash":new BinData(0, hexToBase64(endian(hashstr)))}); 
}

function blockchain_height() {
    return db.blocks.find({"main":true, "connected":true}, {"height":1, "hash":1}).sort({"height":-1}).limit(1)
}

function reset() {
    db.transactions.remove();
    db.blocks.remove();
}

