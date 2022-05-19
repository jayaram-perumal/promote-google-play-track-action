import { getInput, exportVariable, setFailed, debug, info } from '@actions/core';
import { writeFileSync, unlinkSync } from 'fs';
import { google } from 'googleapis';

const serviceAccountJsonPlainTextFile = "./serviceAccountJsonPlainText.json";

export async function promote() {
    try {
        const serviceAccountJsonPlainText = getInput('serviceAccountJsonPlainText', { required: true });
        const packageName = getInput('packageName', { required: true });
        const fromTrack = getInput('fromTrack', { required: true });
        const toTrack = getInput('toTrack', { required: true });
        const testOnlyInput = getInput('testOnly');

        let testOnly = false;
        if(testOnlyInput)
        {
            testOnly = testOnlyInput.toLowerCase() === "true";
            if(testOnly === true)
            {    
                info("This promotion will not commit any changes due to running in test mode");
            }
        }
        
        saveServiceAccountJsonFile(serviceAccountJsonPlainText);

        const androidPublisher = google.androidpublisher('v3');

        const googleAuthClient = getGoogleAuthClient();

        const appEdit = await androidPublisher.edits.insert({
            packageName: packageName,
            auth: googleAuthClient
        });
        
        const releaseToPromote = getCurrentTrackRelease(androidPublisher, googleAuthClient, appEdit, packageName, fromTrack);

        if(releaseToPromote)
        {
            info(`Found release to promote with version ${releaseToPromote.versionCodes[0]} currently in the ${fromTrack} track`);
            await publisher.edits.tracks.update({
                auth: authClient,
                editId: appEdit.data.id,
                track: toTrack,
                packageName: packageName,
                requestBody: {
                track: toTrack,
                releases: releaseToPromote
                }
            });

            if(!testOnly)
            {
                info('Committing changes');
                const commitResult = await publisher.edits.commit({
                    auth: authClient,
                    editId: appEdit.data.id,
                    packageName: packageName
                });
                
                if (!commitResult.data.id) {
                    setFailed(`Error ${commitResult.status} : ${commitResult.statusText}`);
                    return;
                }

                info('The release has been successfully promoted');
            }
        }
        else
        {
            info(`Failed to find the latest release in the ${fromTrack} track to promote. Nothing was promoted.`)
        }
    }
    catch (error) 
    {
        setFailed(error);
    }
}

export async function cleanup() {
    unlinkSync(serviceAccountJsonPlainTextFile);
}

async function getGoogleAuthClient() {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });
    return await auth.getClient();
}

async function saveServiceAccountJsonFile(serviceAccountJsonPlainText) {
    debug('Saving service account JSON for temporary use');
    writeFileSync(serviceAccountJsonPlainTextFile, serviceAccountJsonPlainText, {
      encoding: 'utf8'
    });
    exportVariable("GOOGLE_APPLICATION_CREDENTIALS", serviceAccountJsonPlainTextFile);
}

async function getCurrentTrackRelease(androidPublisher, googleAuthClient, appEdit, packageName, fromTrack){
    info(`Searching for the latest release to promte inside the ${fromTrack} track`);
    const currentTrack = await androidPublisher.edits.tracks.get({
        auth: googleAuthClient,
        packageName: packageName,
        editId: appEdit.editId,
        track: fromTrack
      });
      if(length(currentTrack.data.releases) != 0)
      {
        return currentTrack.data.releases[length(currentTrack.data.releases) - 1];
      }
      else
      {
          return null;
      }
      
}
