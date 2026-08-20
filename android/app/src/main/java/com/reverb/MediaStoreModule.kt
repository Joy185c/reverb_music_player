package com.reverb

import android.content.ContentUris
import android.provider.MediaStore
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class MediaStoreModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "MediaStoreModule"
    }

    @ReactMethod
    fun getAudioFiles(promise: Promise) {
        try {
            val audioList = Arguments.createArray()
            val contentResolver = reactApplicationContext.contentResolver
            val uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
            
            val projection = arrayOf(
                MediaStore.Audio.Media._ID,
                MediaStore.Audio.Media.TITLE,
                MediaStore.Audio.Media.ARTIST,
                MediaStore.Audio.Media.ALBUM,
                MediaStore.Audio.Media.DURATION,
                MediaStore.Audio.Media.ALBUM_ID,
                MediaStore.Audio.Media.DATA
            )

            // Only music files
            val selection = "${MediaStore.Audio.Media.IS_MUSIC} != 0"
            val sortOrder = "${MediaStore.Audio.Media.DATE_ADDED} DESC"

            val cursor = contentResolver.query(uri, projection, selection, null, sortOrder)

            cursor?.use { c ->
                val idColumn = c.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
                val titleColumn = c.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
                val artistColumn = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
                val albumColumn = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
                val durationColumn = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
                val albumIdColumn = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID)
                val dataColumn = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA)

                val artworkUriBase = android.net.Uri.parse("content://media/external/audio/albumart")

                while (c.moveToNext()) {
                    val id = c.getLong(idColumn)
                    val title = c.getString(titleColumn) ?: "Unknown Title"
                    val artist = c.getString(artistColumn) ?: "Unknown Artist"
                    val album = c.getString(albumColumn) ?: "Unknown Album"
                    val duration = c.getLong(durationColumn)
                    val albumId = c.getLong(albumIdColumn)
                    val dataPath = c.getString(dataColumn) ?: ""

                    val contentUri = ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id)
                    val albumArtUri = ContentUris.withAppendedId(artworkUriBase, albumId)

                    val audioMap = Arguments.createMap()
                    audioMap.putString("id", "device_media_$id")
                    audioMap.putString("title", title)
                    audioMap.putString("artist", artist)
                    audioMap.putString("album", album)
                    audioMap.putDouble("duration", duration.toDouble())
                    audioMap.putString("sourceUrl", contentUri.toString())
                    audioMap.putString("localPath", dataPath)
                    audioMap.putString("artworkPath", albumArtUri.toString())

                    audioList.pushMap(audioMap)
                }
            }

            promise.resolve(audioList)
        } catch (e: Exception) {
            promise.reject("MEDIA_STORE_ERROR", e.message)
        }
    }
}
