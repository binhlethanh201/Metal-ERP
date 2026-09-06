/**
 * useBarcodeScanner - Custom hook quản lý logic quét mã vạch bằng camera
 * Sử dụng thư viện html5-qrcode để mở camera và nhận diện mã vạch/QR code
 */
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';

let GlobalScannerInstance = null;

const DEFAULT_CONFIG = {
  fps: 10,
  qrbox: { width: 280, height: 160 },
  aspectRatio: 1.0,
  formatsToSupport: [
    'EAN_13',
    'EAN_8',
    'CODE_128',
    'CODE_39',
    'CODE_93',
    'UPC_A',
    'UPC_E',
    'QR_CODE',
    'DATA_MATRIX',
    'PDF_417',
    'AZTEC',
    'ITF',
    'CODABAR',
    'UPC_EAN_EXTENSION',
  ],
};

export const useBarcodeScanner = (scanConfig = {}) => {
  const config = useMemo(() => ({ ...DEFAULT_CONFIG, ...scanConfig }), [JSON.stringify(scanConfig)]);

  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [scannedResult, setScannedResult] = useState(null);
  const [lastScannedAt, setLastScannedAt] = useState(null);

  const scannerRef = useRef(null);
  const lastScanRef = useRef({ text: '', time: 0 });
  const scanCooldownMs = 500;

  const onScanSuccess = useCallback(
    (decodedText, decodedResult) => {
      const now = Date.now();
      if (
        decodedText === lastScanRef.current.text &&
        now - lastScanRef.current.time < scanCooldownMs
      ) {
        return;
      }

      lastScanRef.current = { text: decodedText, time: now };
      setScannedResult(decodedText);
      setLastScannedAt(new Date());
    },
    []
  );

  const onScanFailure = useCallback((error) => {
    if (error?.message?.includes('NotAllowed')) {
      setHasCameraPermission(false);
      setCameraError(
        'Bạn đã từ chối cấp quyền camera. Vui lòng bật quyền camera trong cài đặt trình duyệt.'
      );
    }
  }, []);

  const startScanning = useCallback(async (containerId = 'scanner-container') => {
    setCameraError(null);
    setScannedResult(null);
    setIsScanning(true);
    setHasCameraPermission(true);

    try {
      if (GlobalScannerInstance) {
        await GlobalScannerInstance.clear();
        GlobalScannerInstance = null;
      }

      let cameras;
      try {
        cameras = await Html5Qrcode.getCameras();
      } catch (err) {
        console.error('[useBarcodeScanner] GetCameras error:', err);
        throw new Error('Không thể truy vấn danh sách camera. Thiết bị có thể không có camera hoặc trình duyệt đang chặn quyền.');
      }

      if (!cameras || !cameras.length) {
        throw new Error('Không tìm thấy camera trên thiết bị này.');
      }

      let cameraId = cameras.find((d) =>
        d.label.toLowerCase().includes('back') ||
        d.label.toLowerCase().includes('rear') ||
        d.label.includes('facing environment')
      )?.id;

      if (!cameraId) {
        cameraId = cameras[cameras.length - 1].id;
      }

      GlobalScannerInstance = new Html5QrcodeScanner(containerId, {
        fps: config.fps,
        qrbox: config.qrbox,
        aspectRatio: config.aspectRatio,
        disableFlip: false,
      }, false);

      await GlobalScannerInstance.render(onScanSuccess, onScanFailure);
      scannerRef.current = GlobalScannerInstance;

      return true;
    } catch (err) {
      console.error('[useBarcodeScanner] Lỗi khi mở camera:', err);
      setCameraError(err.message || 'Không thể khởi động camera. Vui lòng thử lại.');
      setIsScanning(false);
      return false;
    }
  }, [config, onScanSuccess, onScanFailure]);

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (e) {
        console.warn('[useBarcodeScanner] Lỗi khi dừng scanner:', e);
      }
      scannerRef.current = null;
    }
    GlobalScannerInstance = null;
    setIsScanning(false);
    setCameraError(null);
  }, []);

  const clearResult = useCallback(() => {
    setScannedResult(null);
    setLastScannedAt(null);
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  return {
    isScanning,
    hasCameraPermission,
    cameraError,
    scannedResult,
    lastScannedAt,
    startScanning,
    stopScanning,
    clearResult,
  };
};

export default useBarcodeScanner;
