import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface DataUploaderProps {
  onDataLoaded: (data: any[], fileName: string) => void;
}

export const DataUploader: React.FC<DataUploaderProps> = ({ onDataLoaded }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const processFile = useCallback((file: File) => {
    setUploadStatus('processing');
    setFileName(file.name);
    setError('');

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setUploadStatus('success');
            onDataLoaded(results.data, file.name);
          } else {
            setUploadStatus('error');
            setError('No data found in CSV file');
          }
        },
        header: true,
        dynamicTyping: true,
        error: (error) => {
          setUploadStatus('error');
          setError(`CSV parsing error: ${error.message}`);
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          if (jsonData.length > 0) {
            setUploadStatus('success');
            onDataLoaded(jsonData, file.name);
          } else {
            setUploadStatus('error');
            setError('No data found in Excel file');
          }
        } catch (error) {
          setUploadStatus('error');
          setError(`Excel parsing error: ${error}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setUploadStatus('error');
      setError('Please upload a CSV or Excel file');
    }
  }, [onDataLoaded]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const resetUpload = () => {
    setUploadStatus('idle');
    setFileName('');
    setError('');
  };

  if (uploadStatus === 'success') {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Data loaded successfully!</p>
                <p className="text-sm text-green-700">{fileName}</p>
              </div>
            </div>
            <button
              onClick={resetUpload}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploadStatus === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={uploadStatus === 'processing'} />
        
        <div className="flex flex-col items-center space-y-4">
          {uploadStatus === 'processing' ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Processing {fileName}...</p>
            </>
          ) : uploadStatus === 'error' ? (
            <>
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-red-600 font-medium">{error}</p>
              <p className="text-sm text-gray-600">Try uploading another file</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop your file here' : 'Upload your data'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Drag and drop a CSV or Excel file, or click to browse
                </p>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>CSV</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {!uploadStatus && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              const demoData = [
                { date: '2024-01-01', revenue: 125000, region: 'North', product: 'Enterprise' },
                { date: '2024-01-02', revenue: 132000, region: 'South', product: 'Professional' },
                { date: '2024-01-03', revenue: 118000, region: 'East', product: 'Basic' },
                { date: '2024-01-04', revenue: 145000, region: 'West', product: 'Enterprise' },
                { date: '2024-01-05', revenue: 139000, region: 'North', product: 'Professional' }
              ];
              onDataLoaded(demoData, 'demo-data.csv');
              setUploadStatus('success');
              setFileName('demo-data.csv');
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Or use demo data to get started
          </button>
        </div>
      )}
    </div>
  );
};