# SplatsRenderer
The hands-on tutorial on the usage of the modern rendering approaches of the Gaussian Splats. The tutorial consists of two parts: GPU-powered rendering and WebGL real-time interractive rendering. You may follow either of the steps.

## GPU-powered Rendering (`gsplat`)

The following [notebook](https://colab.research.google.com/drive/1hnwB1YAFrg1VG_3pTBra3biBuDjjIROs?usp=sharing) provides an easy way to render a gaussian splats scene from a `.ply` file using `gsplat` library (the notebook is also available in the `src` folder). All [necessary binaries](https://github.com/DavidVista/SplatsRenderer/blob/main/cuda_files.zip) for T4 CUDA suitable for Google Colab were pre-compiled. You can follow the notebook link above and run the rendering cells to see how splats scenes can be viewed easily directly in the notebook.

The notebook highlights loading of splats files and render of frames. `gsplat` library is employed for these purposes. On top of that, `mediapy` is used for rendering in the notebook for direct viewing of videos. Next, object detection on rendered frames is performed using \lstinline{ultralytics} YOLO-v5 detection model. Furthermore, the path planning pipeline is presented. Initially, the voxel grid is created for the extraction of spatial characteristics. Then, points on the path are sampled and filtered using Poisson Disk. These points are connected into a single path using A* path finding algorithm. Finally, the discrete path is smoothed using cubic Hermite.

The notebook does not provide advanced scene navigation and exploration, moreover, the detection pipeline performes poorly. You can contribute to the notebook for better tutorial experience.

## WebGL Real-time Rendering (Spark.js)

[Spark.js](https://sparkjs.dev/docs/) is a WebGL rendering engine for gaussian splats that has flexibility to be extended to any web application. To make the rendering pipeline interactive, I designed a simple web application for rendering a scene, moving around with keyboard controls, and rotating using a mouse. You can follow further instructions to know how to launch the app.

### Installation

Firstly, clone this repository:

```bash
git clone https://github.com/DavidVista/SplatsRenderer
```

Next, install `spark.js` module using `npm`. For more details, follow the official [documentation](https://sparkjs.dev/docs/):
```bash
npm install @sparkjsdev/spark
```

Finally, ensure you have installed python or any other mean of launching an http server. Here I would stick to Python for simplicity:
```bash
python -m http.server 8000
```

You can follow the address [http://127.0.0.1:8000](http://127.0.0.1:8000) to see the application.

In the app, you can load sample scenes from the following [Google Disk](https://drive.google.com/file/d/1Fd04T_sPGkozim08N72jZaaObANXx5-A/view?usp=sharing).

