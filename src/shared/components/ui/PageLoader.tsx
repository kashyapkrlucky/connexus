export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-800 border-t-gray-100" />
        <p className="text-sm font-medium text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
