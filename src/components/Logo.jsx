import logoImage from '../assets/react.svg';

export function Logo() {
  return (
    <div className="d-flex justify-content-center">
      <img 
        className="mb-4 logo" 
        src={logoImage} 
        alt="Bslista Logo" 
        width="120" 
        height="120" 
      />
    </div>
  );
}