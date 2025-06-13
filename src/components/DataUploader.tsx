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
      <div className="w-full max-w-4xl mx-auto p-6 animate-scale-in">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-neutral-900">Data loaded successfully!</p>
                <p className="text-sm text-neutral-600 mt-0.5">{fileName}</p>
              </div>
            </div>
            <button
              onClick={resetUpload}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer 
          transition-all duration-300 group overflow-hidden
          ${isDragActive 
            ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-accent-50 scale-[1.02]' 
            : 'border-neutral-300 hover:border-brand-400 hover:shadow-lg bg-white'
          }
          ${uploadStatus === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={uploadStatus === 'processing'} />
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-10 right-10 w-32 h-32 bg-brand-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-accent-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative flex flex-col items-center space-y-6">
          {uploadStatus === 'processing' ? (
            <>
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-200"></div>
                <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-brand-600 border-t-transparent"></div>
              </div>
              <div>
                <p className="text-lg font-medium text-neutral-900">Processing {fileName}...</p>
                <p className="text-sm text-neutral-500 mt-1">This may take a moment</p>
              </div>
            </>
          ) : uploadStatus === 'error' ? (
            <>
              <div className="p-4 bg-red-100 rounded-2xl">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-red-900">{error}</p>
                <p className="text-sm text-neutral-600 mt-1">Try uploading another file</p>
              </div>
            </>
          ) : (
            <>
              <div className={`p-6 rounded-2xl transition-all duration-300 ${
                isDragActive 
                  ? 'bg-brand-100 scale-110' 
                  : 'bg-gradient-to-br from-neutral-50 to-neutral-100 group-hover:from-brand-50 group-hover:to-brand-100'
              }`}>
                <Upload className={`w-16 h-16 transition-colors ${
                  isDragActive ? 'text-brand-600' : 'text-neutral-400 group-hover:text-brand-500'
                }`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 mb-2">
                  {isDragActive ? 'Drop your file here' : 'Upload your data'}
                </p>
                <p className="text-base text-neutral-600">
                  Drag and drop a CSV or Excel file, or click to browse
                </p>
              </div>
              <div className="flex items-center justify-center space-x-8 pt-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 rounded-full">
                  <FileSpreadsheet className="w-5 h-5 text-brand-600" />
                  <span className="text-sm font-medium text-neutral-700">CSV</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 rounded-full">
                  <FileSpreadsheet className="w-5 h-5 text-brand-600" />
                  <span className="text-sm font-medium text-neutral-700">Excel</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {!uploadStatus && (
        <div className="mt-6 text-center">
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
            className="text-brand-600 hover:text-brand-700 text-sm font-semibold 
                     hover:underline underline-offset-4 transition-all"
          >
            Need sample data? Click here to load demo dataset
          </button>
        </div>
      )}
    </div>
  );
};