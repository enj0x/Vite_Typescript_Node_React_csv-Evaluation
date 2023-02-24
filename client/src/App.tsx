import { useState } from 'react';
import axios from 'axios';

import './assets/scss/_main.scss';

function App() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCsvFile(event.target.files?.[0] || null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (csvFile !== null) {
      const reader = new FileReader();
      reader.readAsText(csvFile);
      reader.onload = async () => {
        const csvData: string = encodeURIComponent(reader.result as string);
        try {
          const response = await axios.get(`/evaluation?data=${csvData}`);
          setResult(response.data);
          console.log(JSON.parse(response.data));
        } catch (error) {
          console.log(error);
        }
      };
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <label>
          Upload a CSV file:
          <br />
          <input type="file" onChange={handleFileChange} />
        </label>
        <br />
        <button type="submit">Upload</button>
      </form>
      <p>result : {result}</p>
    </div>
  );
}

export default App;
