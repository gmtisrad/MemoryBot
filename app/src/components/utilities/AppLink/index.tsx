import { useNavigate } from 'react-router-dom';

interface LinkBehaviorProps {
  href: string;
  sx?: any;
  children: React.ReactNode;
}

export const AppLink = ({ href, ...other }: LinkBehaviorProps) => {
  const navigate = useNavigate();

  // Map href (MUI) -> to (react-router)
  return (
    <div
      style={other.sx}
      data-testid="custom-link"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        navigate(href);
      }}
      role="button"
      {...other}
    >
      {other.children}
    </div>
  );
};
