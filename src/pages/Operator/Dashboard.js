import React, { useEffect, useState } from 'react';
import "./operatorpanel.css";
import printJS from 'print-js';

const Dashboard = () => {
  const [rows, setRows] = useState([]);

  // URL of the image to be downloaded
  const imageURL = "https://downloadqrcode.s3.ap-south-1.amazonaws.com/qrcode.png"; // Replace with the actual image URL

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('http://13.233.50.175:8080/api/v1/getFiles');
        const data = await response.json();
    
        if (data.success && data.files) {
          const recentTimeThreshold = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
    
          const recentFiles = data.files.filter(file => {
            const fileModifiedTime = new Date(file.lastModified);
            return fileModifiedTime > recentTimeThreshold;
          });
    
          const formattedRows = recentFiles.map((file, index) => ({
            tokenNumber: index + 1, // Serial number
            fileName: file.key,
            copies: 1, // Default value
            typeOfPrint: 'Black & white',
            paperSize: 'A4',
            sides: 'Double-sided',
            status: 'Print',
            url: file.url
          }));
    
          setRows(formattedRows);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
        // Handle error appropriately
      }
    };
    
    fetchFiles();
  }, []);

  const handlePrint = (fileUrl) => {
    // Existing print logic...
    const fileType = fileUrl.split('.').pop().toLowerCase();
    let printConfig = {
      printable: fileUrl,
      showModal: true,
      modalMessage: "Document Loading...",
      onError: (err) => console.log(err),
      fallbackPrintable: () => console.log("FallbackPrintable"),      
      onPrintDialogClose: () => console.log('The print dialog was closed')
    };
  
    if (['pdf'].includes(fileType)) {
      printConfig.type = 'pdf';
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
      printConfig.type = 'image';
    } else {
      console.error('Unsupported file type for printing');
      return;
    }
  
    printJS(printConfig);
  };

  const handleDownload = () => {
    // Open the image in a new tab
    window.open(imageURL, '_blank');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Xerox Shop</h1>
        {/* Download button next to h1 tag */}
        <button onClick={handleDownload}>Download QR</button>
        {/* Profile image (commented out) */}
        {/* <img src="path-to-profile-image.jpg" alt="Profile" className="profile-image" /> */}
      </header>

      {/* Rendering of the table */}
      <table>
        <thead>
          <tr>
            <th>Token Number</th>
            <th>File Name</th>
            <th>No. of copies</th>
            <th>Type of print</th>
            <th>Paper Size</th>
            <th>Sides</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{row.tokenNumber}</td>
              <td>{row.fileName}</td>
              <td>{row.copies}</td>
              <td>{row.typeOfPrint}</td>
              <td>{row.paperSize}</td>
              <td>{row.sides}</td>
              <td>
                <button onClick={() => handlePrint(row.url)}>Print</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
