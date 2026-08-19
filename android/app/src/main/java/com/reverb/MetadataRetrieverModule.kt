package com.reverb

import android.media.MediaMetadataRetriever
import android.net.Uri
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class MetadataRetrieverModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "MetadataRetriever"
    }

    @ReactMethod
    fun getMetadata(filePath: String, promise: Promise) {
        val retriever = MediaMetadataRetriever()
        try {
            if (filePath.startsWith("content://") || filePath.startsWith("file://")) {
                retriever.setDataSource(reactApplicationContext, Uri.parse(filePath))
            } else {
                retriever.setDataSource(filePath)
            }

            val title = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_TITLE)
            val artist = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ARTIST)
            val album = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ALBUM)
            val durationStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
            val duration = durationStr?.toLongOrNull() ?: 0L

            var artworkPath = ""
            val picture = retriever.embeddedPicture
            if (picture != null) {
                try {
                    val appDir = File(reactApplicationContext.filesDir, "REVERB/artwork")
                    if (!appDir.exists()) {
                        appDir.mkdirs()
                    }
                    val fileName = "art_${System.currentTimeMillis()}.jpg"
                    val file = File(appDir, fileName)
                    file.writeBytes(picture)
                    artworkPath = file.absolutePath
                } catch (e: Exception) {
                    // Ignore artwork save failure
                }
            }

            val map = Arguments.createMap()
            map.putString("title", title ?: "Unknown Title")
            map.putString("artist", artist ?: "Unknown Artist")
            map.putString("album", album ?: "Unknown Album")
            map.putDouble("duration", duration.toDouble())
            map.putString("artworkPath", artworkPath)

            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("METADATA_ERROR", e.message)
        } finally {
            try {
                retriever.release()
            } catch (e: Exception) {
                // Ignore
            }
        }
    }
}
