# promote-google-play-track-action
A Github action that can be used to promote the track of an app release on the Google Play Store

## Example usage

```yaml
uses: jayaram-perumal/upload-google-play-track-action@v1
with:
  serviceAccountJson: ${{ SERVICE_ACCOUNT_JSON_PATH }}
  serviceAccountJsonPlainText: ${{ SERVICE_ACCOUNT_JSON }}
  packageName: com.example.MyApp
  fromTrack: internal
  toTrack: alpha
```