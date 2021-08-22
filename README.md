# CVProject

At the moment, just a collection of test files testing different python libraries. 

# How to run
## Pre-requisites
* OBS - download from [here](https://obsproject.com/download)
* Python - download from ???

Recommended: create and activate a python virtual environment for the application:
The following command can be run from the root directory of the git repository. 
It creates a virtual environment `py_env` in this root directory. The `.gitignore`
is set to ignore it from the version control system - so no risk to have `git` upload
the whole python environment.

```
python -m venv py_env
.\py_env\Scripts\activate
```

Install python libraries/requirements

```
pip install -r requirements.txt
```

## Virtual webcam `Virtual_Webcam_Test.py`
`Virtual_Webcam_Test.py` - tests creating a virtual webcam that shows test_image.jpg

Run using the following command from the project root directory:

```
python Virtual_Webcam_Test.py
```

If you see an error as shown below, it means that OBS was likely to not have been installed or 
configured correctly.

```
Traceback (most recent call last):
  File "C:\Users\julie\Development\shreddy\CVProject\Virtual_Webcam_Test.py", line 11, in <module>
    with pyvirtualcam.Camera(width=640, height=480, fps=20) as cam:
  File "C:\Users\julie\Development\shreddy\CVProject\py_env\lib\site-packages\pyvirtualcam\camera.py", line 219, in __init__
    raise RuntimeError('\n'.join(errors))
RuntimeError: 'obs' backend: OBS Virtual Camera device not found! Did you install OBS?
'unitycapture' backend: No camera registered. Did you install any camera?
```

## CV + Virtual webcam together
This merge the capture of webcam, replacement of background with redirecting the output as a visible frame as well as an output to the OBS virtual camera.

Run using the following command from the project root directory:

```
python python\main.py
```

To-do: The code should be refactored in the following:
1. Do the webcam capture in a separate thread that would remove background and send the processed images to an image pool [limited in length and FIFO];
2. The broadcasting to the virtual camera should operate in its own thread and pick the image from the pool and display it.
3. Ideally the cv.imshow should also be extracted to its own thread so that we run 3 threads: (a) 1 does the capture, (b) 1 does the broadcasting and (c) 1 does the UI.

The above need some thoughts to ensure that (a) the broadcasting does not run out of image and (b) the webcam does not grow the pool faster than the broadcasting consumes it. A few features required:
* Set the height/width based on the webcam footage;
* Allow the selection of the webcam - in case you have multiple webcam.


## Files
* `CV_Test.py` - tests background replacement for webcam footage

## Requirements
The following should be met with the `requirements.txt` file.
* numpy - download from https://pypi.org/project/numpy/
* OpenCV - download from https://pypi.org/project/opencv-python/
* CVZone - download from https://pypi.org/project/cvzone/
* PyVirtualCam - download from https://pypi.org/project/pyvirtualcam/
* mss - download from https://pypi.org/project/mss/

# www
Attempt to make it available as a web page. Web page done using VueJS.

## Pre-requisite:
* NodeJS from [https://nodejs.org/en/](https://nodejs.org/en/)

## How to use

```
cd www
```

Project setup/preliminary:
```
npm install
```

Compiles and hot-reloads for development
```
npm run serve
```

Compiles for deployment to production
```
npm run build
```
Run unit tests
```
npm run test:unit
```

Lints and fixes files
```
npm run lint
```

