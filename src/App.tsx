import { FaceMesh } from '@mediapipe/face_mesh';
import * as Facemesh from '@mediapipe/face_mesh';
import Webcam from 'react-webcam';
import { useCallback, useEffect, useRef, useState } from 'react';
import { drawConnectors } from '@mediapipe/drawing_utils';

const widthSize = 640;
const heightSize = 480;
function App() {
  const [img, setImg] = useState<string | null>(null);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const webcamRef = useRef<Webcam>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const imgRef = useRef<HTMLImageElement>(null!);

  //let camera = null;
  const onResult = (results: any) => {
    canvasRef.current.width = widthSize;
    canvasRef.current.height = heightSize;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');

    canvasCtx?.save();

    canvasCtx?.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx?.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    if (results.multiFaceLandmarks) {
      if (canvasCtx === null) return;
      const landmarks = results.multiFaceLandmarks[0];
      drawConnectors(canvasCtx, landmarks, Facemesh.FACEMESH_TESSELATION, {
        color: '#C0C0C070',
        lineWidth: 1,
      });
      drawConnectors(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, {
        color: '#FF3030',
      });
      drawConnectors(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, {
        color: '#FF3030',
      });
      drawConnectors(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYE, {
        color: '#30FF30',
      });
      drawConnectors(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYEBROW, {
        color: '#30FF30',
      });
      drawConnectors(canvasCtx, landmarks, Facemesh.FACEMESH_FACE_OVAL, {
        color: '#E0E0E0',
      });
      drawConnectors(canvasCtx, landmarks, Facemesh.FACEMESH_LIPS, {
        color: '#E0E0E0',
      });
    }
    canvasCtx?.restore();
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImg(imageSrc);
  }, [webcamRef]);

  const reset = () => setImg(null);

  const toggleLandmarks = () => setShowLandmarks((state) => !state);

  const faceMeshRef = useRef<FaceMesh>(null!);
  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResult);

    faceMeshRef.current = faceMesh;
  });

  const sendImg = async () => {
    if (img === null) {
      return;
    }
    await faceMeshRef.current.send({
      image: imgRef.current,
    });
  };
  useEffect(() => {
    sendImg();
    // eslint-disable-next-line
  }, [img]);

  useEffect(() => {
    let webGLContext = null;
    const webGLTestCanvas = document.createElement('canvas');
    if (window.WebGLRenderingContext) {
      webGLContext =
        webGLTestCanvas.getContext('webgl') ||
        webGLTestCanvas.getContext('experimental-webgl');
      if (!webGLContext) {
        webGLContext = null;
      }
    }
    if (webGLContext == null) {
      alert(
        "Your browser does not seem to support WebGL. Unfortunately this face deformation example depends on WebGL, so you'll have to try it in another browser. :("
      );
    }
  });

  return (
    <div>
      {!img && (
        <Webcam
          ref={webcamRef}
          style={{
            position: 'absolute',
            margin: 'auto',
            inset: 0,
            width: widthSize,
            height: heightSize,
          }}
          screenshotFormat="image/jpeg"
          audio={false}
        />
      )}

      {img && (
        <img
          ref={imgRef}
          style={{
            position: 'absolute',
            margin: 'auto',
            width: widthSize,
            height: heightSize,
            inset: 0,
          }}
          alt=""
          src={img || ''}
        />
      )}
      {img && showLandmarks && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            margin: 'auto',
            inset: 0,
            width: widthSize,
            height: heightSize,
          }}
        />
      )}
      <button
        style={{
          position: 'absolute',
          top: widthSize,
          left: '30vw',
          margin: 'auto',
        }}
        onClick={img ? reset : capture}
      >
        {img ? 'Reset' : 'Capture photo'}
      </button>
      <button
        style={{
          position: 'absolute',
          top: widthSize,
          right: '30vw',
          margin: 'auto',
        }}
        onClick={toggleLandmarks}
        disabled={true}
      >
        Toggle landmarks
      </button>
    </div>
  );
}

export default App;
