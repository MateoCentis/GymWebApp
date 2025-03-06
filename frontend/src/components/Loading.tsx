interface LoadingProps {
  isLoading: boolean;
}
const Loading = ({ isLoading }: LoadingProps) => {
  // Si no está cargando, no mostrar nada
  if (!isLoading) {
    return null;
  }

  return (
    <div className="loading-overlay">
      {" "}
      {/* Overlay to cover the content */}
      <div className="loading-spinner">
        {" "}
        {/* The actual spinner */}
        {/* You can use a CSS spinner, an image, or a library here */}
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default Loading;

// Ejemplo de uso
// import LoadingSpinner from "./LoadingSpinner"; // Import the component

// const MyComponent = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Simulate an asynchronous operation (e.g., fetching data)
//   React.useEffect(() => {
//     setTimeout(() => {
//       setData({
//         /* ... your data ... */
//       }); // Replace with actual data fetching
//       setLoading(false);
//     }, 2000); // Simulate 2-second delay
//   }, []);

//   return (
//     <div>
//       <LoadingSpinner isLoading={loading} /> {/* Use the component */}
//       {/* Conditionally render your content when not loading */}
//       {!loading && data && (
//         <div>
//           {/* Display your data here */}
//           {/* ... */}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Loading;
