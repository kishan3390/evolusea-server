export const ErrorContainer = ({ error }: { error: Error }) => (
  <div className="error-container">{error.message}</div>
);
