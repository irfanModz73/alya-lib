// index.js

const TikTokStalk = require('./lib/tiktok');

class Alya {
    constructor(options = {}) {
        this.options = options;
        this.tiktok = new TikTokStalk(options);
    }

    // tikTok Stalker
    async tiktokStalk(username) {
        return this.tiktok.stalk(username);
    }

    // format TikTok result
    formatTikTokResult(data) {
        return this.tiktok.formatResult(data);
    }
}

module.exports = Alya;
