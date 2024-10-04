import tensorflow as tf

# Load MobileNetV3 Large (pretrained on ImageNet)
model = tf.keras.applications.MobileNetV3Large(weights='imagenet', input_shape=(224, 224, 3))

# Convert the model to TensorFlow Lite format
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

# Save the TensorFlow Lite model to a .tflite file
with open('mobilenet_v3_large.tflite', 'wb') as f:
    f.write(tflite_model)

print("MobileNetV3 Large model converted and saved as mobilenet_v3_large.tflite")
