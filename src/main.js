const { getInput, exportVariable, setFailed, info, warning } = require('@actions/core')
const { writeFileSync } = require('fs')
const { google } = require('googleapis')

async function promoteTrack() {
//    const serviceAccountJsonRaw = JSON.stringify(
//      {
//          "type": "service_account",
//          "project_id": "eu-upload-est",
//          "private_key_id": "0f75fbf1866280a4bd68a89cac33ad9537efcb16",
//          "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCg/5PDXjCUBfKQ\nk4zhYHCUh96knD2ZPPeVj9+ZWDR25N1Eby99QbHkUMkR6mNiRtfbGVx6QbSVRzVv\nXBmG9Qwy52v3eD7HLPXCPWB1Rin81FkqzAnQ52KMihYP8e+LOOd8ERSlzBUzAq0a\nyg2Ed9zKCiqgdu1b6NIusjY2ZGLgswLVveBsLSk9iulD5sJd9qUsn0Xp0NOohijD\nkJeu8jjzHz0d//pDixOkaRx5UbXLuoSzX7z9YO4ufmJ7f+VnANqStPjQLJ3lKIa6\ng3rECwvDFkwUcXc7Fc5QFXhjoYHYrncqzqojATAzLb/kl5WTYZrctysCc3yStBBf\nMjI0mgOxAgMBAAECggEAA6vZpvWPmnEuxyLNjlOhyZSgwaScR9GS4ewYQ2x2SM+e\npz7OU0xuKy3M7Kh0GE5Tgd1oj+ijlAOzTse9FMg4fUjXRqXChQ32njWXrMubGEGl\nirhrpmH/toL3w74RfMghHjcGVKK3CTUKdRSOXZrn8+BVY8Kb1nH/E1MbcZ7VKDjK\nLQiGRJiLwMk/WTLkwjJU0Ql25bE9MORp4ZkN3Zi2w4oekZY/IdUPuF6VcYf3Zm0v\niuOPgb1qZG/KHJRMmQsScNVIUkG6hBZjukx2wSbrTpQYG5a0OSbEPXHAshMqI0kE\n/pDj7YLY2+q0rtF5/gOQ+u+aoSqiPm7rZh45xZamyQKBgQDbYhk+LxV9d/EiZudt\nnMqCClqUgkZH9eFcfZNhC/lKSmkh6UfHIsd6d9oqfwENIQ1shiwMBnjHTJfNdJ4l\nSqNUx6omKZeJjrAKFmst61sMtav/m96o0orP/Qakoy1Q2ZUcrmouyuLqkasX6gDk\nAezRGqMK+UErU2nBawqqqFV4uQKBgQC73skBNB+9pPQqCmZ3w0M3tIndzvRHZfDU\nWd707oQhQYt4R24RaUpfn0NBeDqAalamjKQTEVCFoujsDiRDSCc5Mhc1Xp7whl10\nBblnyOtqbALLdVC5WVlXoqKKuNkM5YUYhVzWsTm1lHOzSaMx/MPsH+wLSnduP+XD\nT0OxAXT2uQKBgQCS/1tcsF3c8WZQn9UIPFvw4JErG1OOWjHEMJx1FXnXjp59S3t9\n8k7pP6+ec/U3X+NHyWtwL1H0cNzynOZupGFmqFbZNVtFn6dTSwxL+3zJul1ia4W5\nZ0H99VPjMzdlCjYAvtmFOwrrE+opnvEz1hphTlDbRIKnTj/5iwjdqueCeQKBgG6M\ndfMDXPoXKqXiYNFwUQlibw3aTdwFnGUYTR4LjCyViSBJx/bu4hjKeqT3vlT6Perb\nL2EY+yzn4++jkqsUth/t3cJF33jhV/SBucvcasrArBRVAB9Q+EWdKdA/XVk9Zcg8\nEZkzyCWVKVACsMklV5SGZDtwoj550xXOeqKZnN3hAoGBAI8F5Vtevc4r0K6l9WfX\nNJt1ETrJGNGfbuS4pBRnBnbwZYBypnpMfWqf2ljoARhHijREK25k5s9GYO5G2Em/\nAQVV3apWOPGe8IZ1PEb2PB4qbTbhA0iJwOJMggsW8IGf/4qzpaNUiwYDd3d3Ke8G\nXH+DdUHDRiuvN9WKz+e2fHBo\n-----END PRIVATE KEY-----\n",
//          "client_email": "remote-upload-app@eu-upload-est.iam.gserviceaccount.com",
//          "client_id": "102768653585172066854",
//          "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//          "token_uri": "https://oauth2.googleapis.com/token",
//          "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//          "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/remote-upload-app%40eu-upload-est.iam.gserviceaccount.com"
//      }
//    )
//    const serviceAccountJson = "./service-credentials.json"
//    const packageName = 'com.trimble.publishgoogleplay'
//    const fromTrack = 'internal' // The current track of the app
//    const toTrack = 'alpha2' // The track to which you want to promote the app

    const serviceAccountJson = getInput('serviceAccountJson', { required: false })
    const serviceAccountJsonRaw = getInput('serviceAccountJsonPlainText', { required: false })
    const packageName = getInput('packageName', { required: true })
    const fromTrack = getInput('fromTrack', { required: true })
    const toTrack = getInput('toTrack', { required: true })

    // Store service credential JSON
    await validateServiceAccountJson(serviceAccountJsonRaw, serviceAccountJson)

    // Set up the Google Play Developer API
    const play = google.androidpublisher({
        version: 'v3',
        auth:  new google.auth.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/androidpublisher']
        })
    })

    try {
        const id = (await play.edits.insert({ packageName })).data.id

        // Get the list of APKs in the from track
        const { data } = await play.edits.tracks.get({
           packageName,
           editId: id,
           track: fromTrack,
        })

        if (data.releases) {
            // Promote the APKs to the target track
            info(`Promoting from ${fromTrack} track to ${toTrack} track`)
            await play.edits.tracks.update({
                packageName,
                editId: id,
                track: toTrack,
                requestBody: {
                  track: toTrack,
                  releases: data.releases,
                },
            })

            // Commit the changes
            info(`Committing the changes`)
            const commitResult = await play.edits.commit({
                packageName,
                editId: id,
            })

            if (!commitResult.data.id) {
                setFailed(`Error ${commitResult.status} : ${commitResult.statusText}`)
                return
            }
            info(`The release has been successfully promoted from ${fromTrack} to ${toTrack}`)
        } else {
            info(`Failed to find the latest release in the ${fromTrack} track to promote. Nothing was promoted`)
        }
    } catch (error) {
        setFailed(error)
    }
}

async function validateServiceAccountJson(serviceAccountJsonRaw, serviceAccountJson) {
    if (serviceAccountJson && serviceAccountJsonRaw) {
        // If the user provided both, print a warning one will be ignored
        warning(`Both 'serviceAccountJsonPlainText' and 'serviceAccountJson' were provided! 'serviceAccountJson' will be ignored.`)
    }
    if (serviceAccountJsonRaw) {
        // If the user has provided the raw plain text, then write to file and set appropriate env variable
        const serviceAccountFile = './serviceAccountJson.json'
        await writeFileSync(serviceAccountFile, serviceAccountJsonRaw, {
            encoding: 'utf8'
        })
        exportVariable("GOOGLE_APPLICATION_CREDENTIALS", serviceAccountFile)
    } else if (serviceAccountJson) {
        // If the user has provided the json path, then set appropriate env variable
        exportVariable("GOOGLE_APPLICATION_CREDENTIALS", serviceAccountJson)
    } else {
        // If the user provided neither, fail and exit
        setFailed(`You must provide one of 'serviceAccountJsonPlainText' or 'serviceAccountJson' to use this action`)
    }
}

// Execute the promotion script
promoteTrack()