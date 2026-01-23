interface ErrorStateProps {
  error: string | Error;
  onRetry?: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Determine error type and provide appropriate messaging
  const getErrorDetails = (msg: string) => {
    if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
      return {
        title: 'Authentication Required',
        message: 'Your session has expired. Please sign in again.',
        icon: '🔒'
      };
    }
    if (msg.includes('403') || msg.toLowerCase().includes('forbidden')) {
      return {
        title: 'Access Denied',
        message: 'You do not have permission to access this resource.',
        icon: '🚫'
      };
    }
    if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
      return {
        title: 'Not Found',
        message: 'The requested resource could not be found.',
        icon: '🔍'
      };
    }
    if (msg.includes('500') || msg.toLowerCase().includes('server error')) {
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        icon: '⚠️'
      };
    }
    return {
      title: 'Error',
      message: msg || 'An unexpected error occurred.',
      icon: '❌'
    };
  };

  const details = getErrorDetails(errorMessage);

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-3xl">{details.icon}</span>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-red-900">{details.title}</h3>
          <p className="mt-2 text-sm text-red-800">{details.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
