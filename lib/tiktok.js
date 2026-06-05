// lib/tiktok.js
// alya stalker-lib
// anuanya const alya = require('alya');
const axios = require('axios');

class TikTokStalk {
    constructor(options = {}) {
        this.timeout = options.timeout || 15000;
        this.userAgent = options.userAgent || 'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.118 Mobile Safari/537.36';
    }

    async stalk(username) {
        if (!username) {
            throw new Error('Username tidak boleh kosong');
        }

        const url = `https://www.tiktok.com/@${username}`;
        const headers = {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
        };

        const response = await axios.get(url, { headers, timeout: this.timeout });
        if (response.status !== 200) throw new Error(`Status code: ${response.status}`);

        const html = response.data;
        const regex = /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/s;
        const matchJson = html.match(regex);
        if (!matchJson) throw new Error('Ga nemu script JSON di halaman');

        const jsonStr = matchJson[1];
        const data = JSON.parse(jsonStr);
        const user = data.__DEFAULT_SCOPE__['webapp.user-detail'].userInfo.user;
        const stats = data.__DEFAULT_SCOPE__['webapp.user-detail'].userInfo.stats;
        const itemList = data.__DEFAULT_SCOPE__['webapp.user-detail'].itemList || [];

        if (!user || !user.id) throw new Error('Ga bisa extract data user');

        let totalView = 0, totalComments = 0, totalShares = 0;
        for (const video of itemList) {
            totalView += video.stats?.playCount || 0;
            totalComments += video.stats?.commentCount || 0;
            totalShares += video.stats?.shareCount || 0;
        }

        let lastPost = 'N/A', lastVideoUrl = 'N/A';
        if (itemList.length) {
            const lastVideo = itemList[0];
            if (lastVideo.createTime) lastPost = new Date(lastVideo.createTime * 1000).toLocaleString('id-ID');
            if (lastVideo.id) lastVideoUrl = `https://www.tiktok.com/@${username}/video/${lastVideo.id}`;
        }

        const createDate = new Date((Number(BigInt(user.id) >> 32n)) * 1000).toLocaleString('id-ID');
        const avatarUrl = user.avatarLarger || user.avatarMedium || user.avatarThumb || 'N/A';

        return {
            success: true,
            data: {
                name: user.nickname || 'N/A',
                id: user.id,
                createDate: createDate,
                followers: stats.followerCount || 0,
                following: stats.followingCount || 0,
                accountStatus: user.privateAccount ? 'private' : 'public',
                bio: user.signature || 'No Bio',
                totalLikes: stats.heartCount || 0,
                region: user.region || 'N/A',
                avatarUrl: avatarUrl,
                verified: user.verified || false,
                lastPost: lastPost,
                lastVideoUrl: lastVideoUrl,
                totalVideo: stats.videoCount || 0,
                totalView: totalView,
                totalComments: totalComments,
                totalShares: totalShares
            }
        };
    }

    formatResult(data) {
        const resultText = `╭═━⪩ TIKTOK STALK ⪥═━╮
┃— Name: ${data.name}
┃— ID-Account: ${data.id}
┃— CreateDate: ${data.createDate}
┃— Followers: ${data.followers.toLocaleString()}
┃— Following: ${data.following.toLocaleString()}
┃— AccountStatus: ${data.accountStatus}
┃— Bio: ${data.bio}
┃— TotalAll-Likes: ${data.totalLikes.toLocaleString()}
┃— Region: ${data.region}
┃— AvatarUrl: ${data.avatarUrl}
┃— Verified: ${data.verified ? 'Yes' : 'No'}
┃— LastPost: ${data.lastPost}
┃— LastVideo: ${data.lastVideoUrl}
┃— TotalVideo: ${data.totalVideo.toLocaleString()}
┃— TotalAll-View: ${data.totalView.toLocaleString()}
┃— CommentCount: ${data.totalComments.toLocaleString()}
┃— ShareCount: ${data.totalShares.toLocaleString()}
╰═━═━═━═━═━═━═━═━═━╯`;

        return resultText;
    }
}

module.exports = TikTokStalk;
