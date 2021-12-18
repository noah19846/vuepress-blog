---
title: window 下的 api 分类整理笔记
date: 2021-12-18 13:21:22
permalink: /pages/e03cfa/
sidebar: auto
categories:
  - 笔记
tags:
  - 
---
window 下的 api 主要分为 ECMAScript API、DOM API、HTML API（其实很多 API 都算是包含在 HTML API 里的，只不过被细分出来，比如 DOM API）、CSSOM 相关的 API，以及剩余的占绝大多数的 Web api（有被纳入规范的和未被纳入规范的，这些 API 都是为浏览器提供特定的功能，比如音视频相关、蓝牙相关等）。这些 Web API 由可能最先由某个组织（比如 W3C、WHATWG、WICG 等）提出，然后被浏览器厂商实现（不一定被纳入标准）。

```
// appVersion: "5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36"

;(function f() {
  const allPropsNames = {
    ecma: [
      'Object',
      'Function',
      'Array',
      'Number',
      'parseFloat',
      'parseInt',
      'Infinity',
      'NaN',
      'undefined',
      'Boolean',
      'String',
      'Symbol',
      'Date',
      'Promise',
      'RegExp',
      'Error',
      'EvalError',
      'RangeError',
      'ReferenceError',
      'SyntaxError',
      'TypeError',
      'URIError',
      'AggregateError',
      'globalThis',
      'JSON',
      'Math',
      'Intl',
      'ArrayBuffer',
      'Uint8Array',
      'Int8Array',
      'Uint16Array',
      'Int16Array',
      'Uint32Array',
      'Int32Array',
      'Float32Array',
      'Float64Array',
      'Uint8ClampedArray',
      'BigUint64Array',
      'BigInt64Array',
      'DataView',
      'Map',
      'BigInt',
      'Set',
      'WeakMap',
      'WeakSet',
      'Proxy',
      'Reflect',
      'Atomics',
      'FinalizationRegistry',
      'WeakRef',
      'decodeURI',
      'decodeURIComponent',
      'encodeURI',
      'encodeURIComponent',
      'escape',
      'unescape',
      'eval',
      'isFinite',
      'isNaN'
    ],
    dom: [
      'Event',
      'CustomEvent',
      'EventTarget',
      'AbortController',
      'AbortSignal',
      'NodeList',
      'HTMLCollection',
      'MutationObserver',
      'MutationRecord',
      'Node',
      'Document',
      'DOMImplementation',
      'DocumentType',
      'DocumentFragment',
      'ShadowRoot',
      'Element',
      'NamedNodeMap',
      'Attr',
      'CharacterData',
      'Text',
      'CDATASection',
      'ProcessingInstruction',
      'Comment',
      'AbstractRange',
      'StaticRange',
      'Range',
      'NodeIterator',
      'TreeWalker',
      'NodeFilter',
      'DOMTokenList',
      'XPathResult',
      'XPathExpression',
      'XPathEvaluator',
      'XSLTProcessor',
      'DOMError',
      'XMLDocument'
    ],
    html: [
      'BarProp',
      'BeforeUnloadEvent',
      'BroadcastChannel',
      'CanvasGradient',
      'CanvasPattern',
      'CanvasRenderingContext2D',
      'CloseEvent',
      'CustomElementRegistry',
      'DOMParser',
      'DOMStringList',
      'DOMStringMap',
      'DataTransfer',
      'DataTransferItem',
      'DataTransferItemList',
      'DragEvent',
      'ElementInternals',
      'ErrorEvent',
      'EventSource',
      'External',
      'FormDataEvent',
      'HTMLDocument',
      'HTMLAllCollection',
      'HTMLAnchorElement',
      'HTMLAreaElement',
      'HTMLAudioElement',
      'HTMLBRElement',
      'HTMLBaseElement',
      'HTMLBodyElement',
      'HTMLButtonElement',
      'HTMLCanvasElement',
      'HTMLDListElement',
      'HTMLDataElement',
      'HTMLDataListElement',
      'HTMLDetailsElement',
      'HTMLDialogElement',
      'HTMLDirectoryElement',
      'HTMLDivElement',
      'HTMLElement',
      'HTMLEmbedElement',
      'HTMLFieldSetElement',
      'HTMLFontElement',
      'HTMLFormControlsCollection',
      'HTMLFormElement',
      'HTMLFrameElement',
      'HTMLFrameSetElement',
      'HTMLHRElement',
      'HTMLHeadElement',
      'HTMLHeadingElement',
      'HTMLHtmlElement',
      'HTMLIFrameElement',
      'HTMLImageElement',
      'HTMLInputElement',
      'HTMLLIElement',
      'HTMLLabelElement',
      'HTMLLegendElement',
      'HTMLLinkElement',
      'HTMLMapElement',
      'HTMLMarqueeElement',
      'HTMLMediaElement',
      'HTMLMenuElement',
      'HTMLMetaElement',
      'HTMLMeterElement',
      'HTMLModElement',
      'HTMLOListElement',
      'HTMLObjectElement',
      'HTMLOptGroupElement',
      'HTMLOptionElement',
      'HTMLOptionsCollection',
      'HTMLOutputElement',
      'HTMLParagraphElement',
      'HTMLParamElement',
      'HTMLPictureElement',
      'HTMLPreElement',
      'HTMLProgressElement',
      'HTMLQuoteElement',
      'HTMLScriptElement',
      'HTMLSelectElement',
      'HTMLSlotElement',
      'HTMLSourceElement',
      'HTMLSpanElement',
      'HTMLStyleElement',
      'HTMLTableCaptionElement',
      'HTMLTableCellElement',
      'HTMLTableColElement',
      'HTMLTableElement',
      'HTMLTableRowElement',
      'HTMLTableSectionElement',
      'HTMLTemplateElement',
      'HTMLTextAreaElement',
      'HTMLTimeElement',
      'HTMLTitleElement',
      'HTMLTrackElement',
      'HTMLUListElement',
      'HTMLUnknownElement',
      'HTMLVideoElement',
      'HashChangeEvent',
      'History',
      'ImageBitmap',
      'ImageBitmapRenderingContext',
      'ImageData',
      'Location',
      'MediaError',
      'MessageChannel',
      'MessageEvent',
      'MessagePort',
      'MimeType',
      'MimeTypeArray',
      'Navigator',
      'OffscreenCanvas',
      'OffscreenCanvasRenderingContext2D',
      'PageTransitionEvent',
      'Path2D',
      'Plugin',
      'PluginArray',
      'PopStateEvent',
      'PromiseRejectionEvent',
      'RadioNodeList',
      'SharedWorker',
      'Storage',
      'StorageEvent',
      'SubmitEvent',
      'TextMetrics',
      'TextTrack',
      'TextTrackCue',
      'TextTrackCueList',
      'TextTrackList',
      'TimeRanges',
      'TrackEvent',
      'ValidityState',
      'WebSocket',
      'Window',
      'Worker',
      'Worklet',
      'Option',
      'Image',
      'Audio'
    ],
    cssom: [
      'MediaList',
      'getComputedStyle',
      'StyleSheet',
      'CSSStyleSheet',
      'StyleSheetList',
      'CSSRuleList',
      'CSSRule',
      'CSSStyleRule',
      'CSSImportRule',
      'CSSGroupingRule',
      'CSSPageRule',
      'CSSNamespaceRule',
      'CSSStyleDeclaration',
      'CSS',
      'CSSMediaRule',
      'CSSConditionRule',
      'CSSSupportsRule',
      'MediaQueryListEvent',
      'MediaQueryList',
      'scroll',
      'screenLeft',
      'screenTop'
    ],
    cssomView: [
      'matchMedia',
      'screen',
      'moveTo',
      'moveBy',
      'scrollTo',
      'scrollBy',
      'resizeTo',
      'resizeBy',
      'innerWidth',
      'innerHeight',
      'scrollX',
      'pageXOffset',
      'scrollY',
      'pageYOffset',
      'screenX',
      'screenY',
      'outerWidth',
      'outerHeight',
      'devicePixelRatio',
      'Screen'
    ],
    xmlHttpRequest: [
      'FormData',
      'XMLHttpRequest',
      'XMLHttpRequestEventTarget',
      'XMLHttpRequestUpload',
      'ProgressEvent'
    ],
    fetch: ['fetch', 'Response', 'Request', 'Headers'],
    webgl: [
      'WebGLBuffer',
      'WebGLFramebuffer',
      'WebGLProgram',
      'WebGLRenderbuffer',
      'WebGLShader',
      'WebGLTexture',
      'WebGLUniformLocation',
      'WebGLActiveInfo',
      'WebGLShaderPrecisionFormat',
      'WebGLRenderingContext',
      'WebGLContextEvent',
      'WebGLQuery',
      'WebGLSampler',
      'WebGLSync',
      'WebGLTransformFeedback',
      'WebGLVertexArrayObject',
      'WebGL2RenderingContext'
    ],
    worker: [
      'ServiceWorker',
      'ServiceWorkerContainer',
      'ServiceWorkerRegistration',
      'NavigationPreloadManager'
    ],
    cssTypedOm: [
      'CSSStyleValue',
      'StylePropertyMapReadOnly',
      'StylePropertyMap',
      'CSSUnparsedValue',
      'CSSVariableReferenceValue',
      'CSSKeywordValue',
      'CSSNumericValue',
      'CSSUnitValue',
      'CSSMathValue',
      'CSSMathSum',
      'CSSMathProduct',
      'CSSMathNegate',
      'CSSMathInvert',
      'CSSMathMin',
      'CSSMathMax',
      'CSSNumericArray',
      'CSSTransformValue',
      'CSSTransformComponent',
      'CSSTranslate',
      'CSSRotate',
      'CSSScale',
      'CSSSkew',
      'CSSSkewX',
      'CSSSkewY',
      'CSSPerspective',
      'CSSMatrixComponent',
      'CSSPositionValue',
      'CSSImageValue'
    ],
    webIdl: ['DOMException'],
    url: ['URL', 'URLSearchParams'],
    streams: [
      'ReadableStream',
      'ReadableStreamDefaultReader',
      'ReadableStreamBYOBReader',
      'ReadableStreamDefaultController',
      'ReadableByteStreamController',
      'ReadableStreamBYOBRequest',
      'WritableStream',
      'WritableStreamDefaultWriter',
      'WritableStreamDefaultController',
      'TransformStream',
      'ByteLengthQueuingStrategy',
      'CountQueuingStrategy'
    ],
    storage: ['StorageManager'],
    notification: ['Notification'],
    encode: [
      'TextDecoder',
      'TextEncoder',
      'TextDecoderStream',
      'TextEncoderStream'
    ],
    backgroundFetch: [
      'BackgroundFetchManager',
      'BackgroundFetchRegistration',
      'BackgroundFetchRecord'
    ],
    backgroundTask: ['IdleDeadline'],
    bluetooth: [
      'Bluetooth',
      'BluetoothCharacteristicProperties',
      'BluetoothDevice',
      'BluetoothRemoteGATTCharacteristic',
      'BluetoothRemoteGATTDescriptor',
      'BluetoothRemoteGATTServer',
      'BluetoothRemoteGATTService',
      'BluetoothUUID'
    ],
    cssRules: [
      'CSSPropertyRule',
      'CSSKeyframesRule',
      'CSSKeyframeRule',
      'CSSFontFaceRule',
      'CSSCounterStyleRule'
    ],
    fontFaceLoad: ['FontFaceSetLoadEvent', 'FontFace'],
    clipboard: ['Clipboard', 'ClipboardItem', 'ClipboardEvent'],
    credential: [
      'Credential',
      'FederatedCredential',
      'PasswordCredential',
      'PublicKeyCredential'
    ],
    encryptedMediaExtensions: [
      'MediaKeys',
      'MediaKeySession',
      'MediaKeyStatusMap',
      'MediaKeySystemAccess',
      'MediaKeyMessageEvent',
      'MediaEncryptedEvent'
    ],
    fileSystemAccess: [
      'FileSystemHandle',
      'FileSystemFileHandle',
      'FileSystemDirectoryHandle',
      'FileSystemWritableFileStream',
      'showOpenFilePicker',
      'showSaveFilePicker',
      'showDirectoryPicker'
    ],
    gamePad: [
      'Gamepad',
      'GamepadButton',
      'GamepadEvent',
      'GamepadHapticActuator'
    ],
    geo: [
      'Geolocation',
      'GeolocationCoordinates',
      'GeolocationPosition',
      'GeolocationPositionError'
    ],
    indexDB: [
      'IDBCursor',
      'IDBCursorWithValue',
      'IDBDatabase',
      'IDBFactory',
      'IDBIndex',
      'IDBKeyRange',
      'IDBObjectStore',
      'IDBOpenDBRequest',
      'IDBRequest',
      'IDBTransaction',
      'IDBVersionChangeEvent'
    ],
    mediaStream: [
      'BlobEvent',
      'MediaDevices',
      'MediaStream',
      'MediaStreamTrack',
      'MediaStreamTrackEvent'
    ],
    webVTT: ['VTTCue'],
    webHID: ['HID', 'HIDDevice', 'HIDInputReportEvent', 'HIDConnectionEvent'],
    webCodecs: [
      'AudioData',
      'AudioDecoder',
      'AudioEncoder',
      'EncodedAudioChunk',
      'EncodedVideoChunk',
      'ImageDecoder',
      'ImageTrack',
      'ImageTrackList',
      'VideoDecoder',
      'VideoEncoder',
      'VideoColorSpace',
      'VideoFrame'
    ],
    webSpeech: [
      'SpeechSynthesisErrorEvent',
      'SpeechSynthesisEvent',
      'SpeechSynthesisUtterance'
    ],
    webMIDI: [
      'MIDIInputMap',
      'MIDIOutputMap',
      'MIDIAccess',
      'MIDIPort',
      'MIDIInput',
      'MIDIOutput',
      'MIDIMessageEvent',
      'MIDIConnectionEvent'
    ],
    webCrypto: ['Crypto', 'CryptoKey', 'SubtleCrypto'],
    webAuth: [
      'CredentialsContainer',
      'AuthenticatorResponse',
      'AuthenticatorAttestationResponse',
      'AuthenticatorAssertionResponse'
    ],
    webAudio: [
      'AnalyserNode',
      'AudioBuffer',
      'AudioBufferSourceNode',
      'AudioContext',
      'AudioDestinationNode',
      'AudioListener',
      'AudioNode',
      'AudioParam',
      'AudioProcessingEvent',
      'AudioScheduledSourceNode',
      'AudioWorklet',
      'AudioWorkletNode',
      'BaseAudioContext',
      'BiquadFilterNode',
      'ChannelMergerNode',
      'ChannelSplitterNode',
      'ConstantSourceNode',
      'ConvolverNode',
      'DelayNode',
      'DynamicsCompressorNode',
      'GainNode',
      'IIRFilterNode',
      'MediaElementAudioSourceNode',
      'MediaStreamAudioDestinationNode',
      'MediaStreamAudioSourceNode',
      'OfflineAudioCompletionEvent',
      'OfflineAudioContext',
      'OscillatorNode',
      'PannerNode',
      'PeriodicWave',
      'WaveShaperNode',
      'StereoPannerNode'
    ],
    webAnimation: [
      'Animation',
      'AnimationEffect',
      'AnimationEvent',
      'AnimationTimeline',
      'AnimationPlaybackEvent',
      'DocumentTimeline',
      'KeyframeEffect'
    ],
    touchEvent: ['Touch', 'TouchEvent', 'TouchList'],
    serviceWorker: [
      'Cache',
      'CacheStorage',
      'PeriodicSyncManager',
      'SyncManager'
    ],
    sensor: [
      'AbsoluteOrientationSensor',
      'Accelerometer',
      'GravitySensor',
      'Gyroscope',
      'LinearAccelerationSensor',
      'OrientationSensor',
      'RelativeOrientationSensor',
      'Sensor',
      'SensorErrorEvent'
    ],
    wakeLock: ['WakeLock', 'WakeLockSentinel'],
    payment: [
      'PaymentAddress',
      'PaymentMethodChangeEvent',
      'PaymentRequest',
      'PaymentRequestUpdateEvent',
      'PaymentResponse',
      'PaymentManager',
      'PaymentInstruments'
    ],
    presentation: [
      'Presentation',
      'PresentationAvailability',
      'PresentationRequest',
      'PresentationConnectionAvailableEvent',
      'PresentationConnection',
      'PresentationConnectionCloseEvent',
      'PresentationReceiver',
      'PresentationConnectionList'
    ],
    geometry: [
      'DOMRectReadOnly',
      'DOMRect',
      'DOMRectList',
      'DOMQuad',
      'DOMMatrixReadOnly',
      'DOMMatrix',
      'DOMPointReadOnly',
      'DOMPoint'
    ],
    trustedType: [
      'TrustedHTML',
      'TrustedScript',
      'TrustedScriptURL',
      'TrustedTypePolicyFactory',
      'TrustedTypePolicy'
    ],
    wasm: ['WebAssembly'],
    file: ['Blob', 'File', 'FileList', 'FileReader'],
    deviceOrientation: [
      'DeviceOrientationEvent',
      'DeviceMotionEventAcceleration',
      'DeviceMotionEventRotationRate',
      'DeviceMotionEvent'
    ],
    push: ['PushManager', 'PushSubscription', 'PushSubscriptionOptions'],
    lqbz: [
      ...['RemotePlayback'],
      ...['ImageCapture'],
      ...['IntersectionObserver', 'IntersectionObserverEntry'],
      ...['LayoutShift', 'LayoutShiftAttribution'],
      ...['PerformanceLongTaskTiming', 'TaskAttributionTiming'],
      ...['MediaCapabilities'],
      ...['MediaMetadata', 'MediaSession'],
      ...[
        'MediaSource',
        'SourceBuffer',
        'SourceBufferList',
        'VideoPlaybackQuality'
      ],
      ...['MediaRecorder'],
      ...['VisualViewport'],
      ...['URLPattern'],
      ...['ScreenOrientation'],
      ...['ResizeObserver', 'ResizeObserverEntry', 'ResizeObserverSize'],
      ...['NetworkInformation'],
      ...['Permissions', 'PermissionStatus'],
      ...['PictureInPictureWindow', 'PictureInPictureEvent'],
      ...['XMLSerializer'],
      ...['TransitionEvent'],
      ...['Selection'],
      ...['SecurityPolicyViolationEvent'],
      ...['ScriptProcessorNode'],
      ...['OverconstrainedError'],
      ...['CSSAnimation', 'CSSTransition'],
      ...['ReportingObserver'],
      ...['MutationEvent'],
      ...['MediaStreamEvent'],
      ...['LargestContentfulPaint'],
      // media-capture
      ...[
        'InputDeviceInfo',
        'InputDeviceCapabilities',
        'CanvasCaptureMediaStreamTrack',
        'MediaDeviceInfo'
      ],
      ...['FeaturePolicy'],
      // w3c community
      ...['DecompressionStream', 'CompressionStream'],
      ...['CookieChangeEvent', 'CookieStore', 'CookieStoreManager'],
      ...['Keyboard', 'KeyboardLayoutMap'],
      ...['NavigatorManagedData'],
      ...['BarcodeDetector'],
      ...['IdleDetector'],
      ...['OTPCredential'],
      ...['CustomStateSet'],
      ...['NavigatorUAData'],
      ...['BatteryManager'],
      ...['BeforeInstallPromptEvent'],
      ...['AudioParamMap'],
      ...['Lock', 'LockManager'],
      ...['VirtualKeyboard']
    ],
    unknown: [
      ...['UserActivation'],
      ...['TaskController', 'TaskPriorityChangeEvent', 'TaskSignal'],
      ...['EventCounts'],
      ...['EyeDropper'],
      ...['FragmentDirective'],
      ...['MediaStreamTrackGenerator', 'MediaStreamTrackProcessor'],
      ...['Profiler'],
      ...['Scheduling'],
      ...['VirtualKeyboardGeometryChangeEvent'],
      ...['DelegatedInkTrailPresenter', 'Ink'], // wicg
      ...['Scheduler'],
      ...['JSCompiler_renameProperty'],
      ...['ShadyCSS'],
      ...[
        'clientInformation',
        'offscreenBuffering',
        'styleMedia',
        'originAgentCluster',
        'trustedTypes',
        'scheduler',
        'openDatabase'
      ]
    ],
    svg: [],
    xr: [],
    webRTC: [],
    performance: [],
    webkit: [],
    usb: [],
    serial: [],
    eventAttr: [],
    uiEvent: [],
    windowProps: []
  }

  let props = Object.getOwnPropertyNames(window)
  Object.keys(allPropsNames).forEach(name => {
    props = filterBFromA(props, allPropsNames[name])
  })

  allPropsNames.svg = props.filter(i => i.startsWith('SVG'))
  props = filterBFromA(props, allPropsNames.svg)

  allPropsNames.xr = props.filter(i => i.startsWith('XR'))
  props = filterBFromA(props, allPropsNames.xr)

  allPropsNames.webkit = props.filter(
    i => i.includes('WebKit') || i.includes('webkit')
  )
  props = filterBFromA(props, allPropsNames.webkit)

  allPropsNames.webRTC = props.filter(i => i.startsWith('RTC'))
  props = filterBFromA(props, allPropsNames.webRTC)

  allPropsNames.usb = props.filter(i => i.startsWith('USB'))
  props = filterBFromA(props, allPropsNames.usb)

  allPropsNames.serial = props.filter(i => i.startsWith('Serial'))
  props = filterBFromA(props, allPropsNames.serial)

  allPropsNames.performance = props.filter(i => i.startsWith('Performance'))
  props = filterBFromA(props, allPropsNames.performance)

  allPropsNames.eventAttr = props.filter(i => i.startsWith('on'))
  props = filterBFromA(props, allPropsNames.eventAttr)

  allPropsNames.uiEvent = props.filter(
    i =>
      i === 'UIEvent' || (window[i] && window[i].prototype instanceof UIEvent)
  )
  props = filterBFromA(props, allPropsNames.uiEvent)

  allPropsNames.windowProps = props.filter(
    n =>
      97 <= n[0].charCodeAt() &&
      n[0].charCodeAt() <= 122 &&
      !Object.keys(console).includes(n) &&
      ![
        'cr',
        'keys',
        'values',
        'undebug',
        'monitor',
        'unmonitor',
        'inspect',
        'copy',
        'queryObjects',
        'getEventListeners',
        'getAccessibleName',
        'getAccessibleRole',
        'monitorEvents',
        'unmonitorEvents'
      ].includes(n)
  )
  props = filterBFromA(props, allPropsNames.windowProps)

  console.log(allPropsNames)

  console.log(props)

  console.log(
    props.length +
      Object.keys(allPropsNames).reduce(
        (acc, cur) => acc + allPropsNames[cur].length,
        0
      )
  )

  function filterBFromA(a, b) {
    return a.filter(i => !b.includes(i))
  }
})()
```
