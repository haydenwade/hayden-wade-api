const config = require('../config').s3bucket;
const aws = require('aws-sdk');
const uuidv4 = require('uuid/v4');
const rp = require('request-promise');

aws.config.update({
    "region": config.region,
    "accessKeyId": config.accessKeyId,
    "secretAccessKey": config.secretAccessKey
});

const repo = {
    /*
    Sample format for briefing:
    {
        "title":"Title that shows in alexa app",
	    "mainText":"This is what will be spoken",
	    "publishDate":"YYYY-MM-DD",
	    "redirectionUrl":"http://haydenwade.com"
        "filename":"somefile.mp3" //optional: omit if not mp3 or mp4
    }
    */
    uploadBriefingsToS3Bucket: (feedName, briefings) => {
        return new Promise(function (resolve, reject) {
            const s3 = new aws.S3();

            const feed = [];
            briefings.forEach(briefing => {
                let feedBriefing = {
                    "uid": "urn:uuid:" + uuidv4(),
                    "updateDate": new Date(briefing.publishDate).toISOString(),
                    "titleText": briefing.titleText,
                    "mainText": briefing.mainText,
                    "redirectionUrl": briefing.redirectionUrl
                };

                if (briefing.filename) {
                    feedBriefing.streamUrl = `https://s3.amazonaws.com/${config.bucketName}/${feedName}/${briefing.filename}`
                }

                feed.push(feedBriefing);
            });

            const file = {
                Bucket: config.bucketName,
                Key: `${feedName}/feed.json`,
                ACL: "public-read",
                ContentType: 'application/json',
                Body: JSON.stringify(feed)
            };

            s3.upload(file, function (err, data) {
                if (err) reject(err);
                resolve(`Feed published to: https://s3.amazonaws.com/${config.bucketName}/${file.Key}/feed.json`);
            });
        });
    },
    uploadMediaToS3Bucket: (feedName, file, contentType = 'audio/mpeg') => {
        return new Promise(function (resolve, reject) {

            const s3 = new aws.S3();

            const media = {
                Bucket: config.bucketName,
                Key: feedName + '/' + file.originalname,
                ACL: "public-read",
                ContentType: contentType,
                Body: file.buffer
            };

            s3.upload(media, function (err, data) {
                if (err) return reject(err);
                resolve();
            });

        });

    },
    fetchBriefingsFromS3Bucket: (briefingName) => {
        return new Promise(function (resolve, reject) {
            const request = {
                uri: `https://s3.amazonaws.com/${config.bucketName}/${briefingName}/feed.json`,
                json: true
            };
            rp(request).then(res => {
                let briefings = [];
                res.forEach(srcBrief => {
                    const brief = {
                        uuid: srcBrief.uid,
                        publishDate: srcBrief.updateDate,
                        titleText: srcBrief.titleText,
                        mainText: srcBrief.mainText,
                        redirectionUrl: srcBrief.redirectionUrl,
                        filename: srcBrief.streamUrl ? srcBrief.streamUrl.substr(srcBrief.streamUrl.lastIndexOf('/') + 1, srcBrief.streamUrl.length - 1) : undefined//hide beginning part of url
                    };
                    briefings.push(brief);
                });
                resolve(briefings);
            }).catch(e => {
                reject(e);
            });
        });
    }
};

module.exports = repo;