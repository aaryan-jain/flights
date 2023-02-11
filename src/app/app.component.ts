import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet.motion/dist/leaflet.motion.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'flights';
  map: L.Map;
  polylines: L.Polyline[] = [];
  motions = [];
  isCurrentMotionPaused: boolean = true;

  m = L as any;
  currentMotion;

  isCurrentMotionInProgress: boolean = false;
  file: any;

  constructor() {}
  flightPathFormGroup: UntypedFormGroup = new FormGroup({
    lat1: new UntypedFormControl(null, [Validators.required]),
    long1: new UntypedFormControl(null, [Validators.required]),
    timeSeries1: new UntypedFormControl(null, [Validators.required]),
    timeSeries2: new UntypedFormControl(null, [Validators.required]),
    lat2: new UntypedFormControl(null, [Validators.required]),
    long2: new UntypedFormControl(null, [Validators.required]),
  });

  extraFlifghtPathFormGroup: UntypedFormGroup = new UntypedFormGroup({
    lat: new UntypedFormArray([]),
    long: new UntypedFormArray([]),
    timeSeries: new UntypedFormArray([]),
  });

  get lat() {
    return this.extraFlifghtPathFormGroup.get('lat') as FormArray;
  }
  get long() {
    return this.extraFlifghtPathFormGroup.get('long') as FormArray;
  }
  get timeSeries() {
    return this.extraFlifghtPathFormGroup.get('timeSeries') as FormArray;
  }

  ngOnInit(): void {}
  listenToCurrentMotion() {
    this.currentMotion?.on('motion-ended', (e) => {
      this.isCurrentMotionInProgress = false;
      this.runMotionForExtraPaths();
    });
  }

  runMotionForExtraPaths() {
    if (this.lat.value.length > 0) {
      const lat1 = this.flightPathFormGroup.get('lat2').value;
      const long1 = this.flightPathFormGroup.get('long2').value;
      const timeSeries1 = this.flightPathFormGroup.get('timeSeries2').value;
      const lat2 = this.lat.value;
      const long2 = this.long.value;
      const timeSeries2 = this.timeSeries.value;
      const times = [timeSeries1, timeSeries2[0]];
      const latLngArr = [
        [lat1, long1],
        [lat2[0], long2[0]],
      ];

      this.lat.removeAt(0);
      this.long.removeAt(0);
      this.timeSeries.removeAt(0);

      this.flightPathFormGroup.get('lat2').setValue(lat2[0]);
      this.flightPathFormGroup.get('long2').setValue(long2[0]);
      this.flightPathFormGroup.get('timeSeries2').setValue(timeSeries2[0]);

      this.animate(times, latLngArr);
    }
  }
  loadPresetValues() {
    this.flightPathFormGroup.get('lat1').setValue(this.flightPaths[0][0][0]);
    this.flightPathFormGroup.get('long1').setValue(this.flightPaths[0][0][1]);
    this.flightPathFormGroup
      .get('timeSeries1')
      .setValue('2021-01-01T00:00:00Z');
    this.flightPathFormGroup.get('lat2').setValue(this.flightPaths[0][1][0]);
    this.flightPathFormGroup.get('long2').setValue(this.flightPaths[0][1][1]);
    this.flightPathFormGroup
      .get('timeSeries2')
      .setValue('2021-01-01T00:00:50Z');
  }

  readonly flightPaths = [
    [
      [37.7749, -122.4194],
      [47.6062, -122.3321],
    ],
  ];

  times = []; // time series in ISO 8601 format
  latlngsArr = [];

  ngAfterViewInit(): void {
    // this.initMap();
    this.initializeMap();
  }

  private initializeMap(): void {
    this.map = L.map('mapp').setView([37.7749, -122.4194], 3);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(
      this.map
    );
  }

  calculate() {
    const times = [];
    const latlngsArr = [];
    const lat1 = this.flightPathFormGroup.get('lat1').value;
    const long1 = this.flightPathFormGroup.get('long1').value;
    const timeSeries1 = this.flightPathFormGroup.get('timeSeries1').value;
    const lat2 = this.flightPathFormGroup.get('lat2').value;
    const long2 = this.flightPathFormGroup.get('long2').value;
    const timeSeries2 = this.flightPathFormGroup.get('timeSeries2').value;
    times.push(timeSeries1, timeSeries2);
    latlngsArr.push([lat1, long1], [lat2, long2]);
    console.log(this.times);
    console.log(this.latlngsArr);
    if (!this.isCurrentMotionInProgress) {
      this.animate(times, latlngsArr);
    }
  }

  animate(times, latlngs) {
    if (this.currentMotion && this.isCurrentMotionPaused) {
      alert('unpause first');
      return;
    }
    const path = latlngs.map((point) => L.latLng(point[0], point[1]));
    const iconHtml = `<div class="custom-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" viewBox="0 0 200 200" fill="none">
                      <rect width="200" height="200" fill="url(#pattern0)"/>
                      <defs>
                      <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
                      <use xlink:href="#image0_1_3" transform="scale(0.005)"/>
                      </pattern>
                      <image id="image0_1_3" width="200" height="200" xlink:href="data:image/png;base64,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"/>
                      </defs>
                      </svg>
                      </div>`;
    const polyline = L.polyline(path, { color: 'orange' }).addTo(this.map);
    this.polylines.push(polyline);
    const animation = this.m.motion
      .polyline(
        path,
        { color: 'blue' },
        {
          auto: false,
        },
        {
          icon: L.divIcon({
            html: iconHtml,
          }),
        }
      )
      .addTo(this.map);
    const endTime = new Date(times[1]).getTime();
    const startTime = new Date(times[0]).getTime();
    const endPoint = latlngs[1];
    const startPoint = latlngs[0];
    const dist = L.latLng({
      lat: startPoint[0],
      lng: startPoint[1],
    }).distanceTo(L.latLng({ lat: endPoint[0], lng: endPoint[1] }));
    const angle = this.getBearing(
      startPoint[0],
      startPoint[1],
      endPoint[0],
      endPoint[1]
    );
    document.documentElement.style.setProperty(
      '--rotation-angle',
      `${angle}deg`
    );
    animation.motionSpeed(dist / ((endTime - startTime) / 1000));
    console.log(`duration -- ${endTime - startTime}ms`);
    animation.motionDuration((endTime - startTime) / 10);
    animation.motionStart();
    this.polylines.push(animation);
    this.currentMotion = animation;
    this.isCurrentMotionPaused = false;
    this.isCurrentMotionInProgress = true;
    console.log('motion started', this.currentMotion.animation);
    this.listenToCurrentMotion();
  }

  pause() {
    if (this.isCurrentMotionPaused) {
      this.isCurrentMotionPaused = false;
      this.currentMotion.motionResume();
    } else {
      this.isCurrentMotionPaused = true;
      this.currentMotion.motionPause();
    }
  }

  addFlightPathData() {
    console.log(this.lat);
    this.lat.push(new UntypedFormControl());
    this.long.push(new UntypedFormControl());
    this.timeSeries.push(new UntypedFormControl());
    console.log(this.lat);
  }

  removeFlightPathData($event: number) {
    this.lat.removeAt($event);
    this.long.removeAt($event);
    this.timeSeries.removeAt($event);
  }

  reset() {
    this.lat.clear();
    this.long.clear();
    this.timeSeries.clear();
    this.flightPathFormGroup.reset();
    this.polylines.forEach((p) => this.map.removeLayer(p));
    this.isCurrentMotionPaused = true;
    this.currentMotion = null;
    this.times = [];
    this.latlngsArr = [];
    this.isCurrentMotionInProgress = false;
    this.file = null;
  }

  uploadData() {}

  onChange(event) {
    this.file = event.target.files[0];
  }

  onUpload() {
    console.log(this.file);
    let fileReader: FileReader = new FileReader();
    let jsonStr;
    let self = this;
    fileReader.onloadend = function (x) {
      jsonStr = fileReader.result;
      self.populateForms(jsonStr);
    };
    fileReader.readAsText(this.file);
    // this.populateForms(jsonArr);
  }
  populateForms(jsonStr) {
    let arr;
    try {
      arr = JSON.parse(jsonStr);
    } catch (e) {
      alert(e);
    }

    if (arr.length < 2) {
      alert('need atleast 2 values');
      return;
    }

    if (arr.length === 2) {
      this.flightPathFormGroup.get('lat1').setValue(arr[0].lat);
      this.flightPathFormGroup.get('long1').setValue(arr[0].lng);
      this.flightPathFormGroup.get('timeSeries1').setValue(arr[0].timestamp);
      this.flightPathFormGroup.get('lat2').setValue(arr[1].lat);
      this.flightPathFormGroup.get('long2').setValue(arr[1].lng);
      this.flightPathFormGroup.get('timeSeries2').setValue(arr[1].timestamp);
    } else if (arr.length >= 2) {
      this.flightPathFormGroup.get('lat1').setValue(arr[0].lat);
      this.flightPathFormGroup.get('long1').setValue(arr[0].lng);
      this.flightPathFormGroup.get('timeSeries1').setValue(arr[0].timestamp);
      this.flightPathFormGroup.get('lat2').setValue(arr[1].lat);
      this.flightPathFormGroup.get('long2').setValue(arr[1].lng);
      this.flightPathFormGroup.get('timeSeries2').setValue(arr[1].timestamp);
      const [a, b, ...c] = arr;

      c.forEach((e) => {
        this.lat.push(new FormControl(e.lat));
        this.long.push(new FormControl(e.lng));
        this.timeSeries.push(new FormControl(e.timestamp));
      });
    }
  }

  private getBearing(lat1, lon1, lat2, lon2) {
    var dLon = lon2 - lon1;
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    var bearing = Math.atan2(y, x);
    console.log(bearing * (360 / Math.PI))
    return bearing * (360 / Math.PI);
  }
}
