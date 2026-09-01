import { DocumentationUploadPage } from '@/features/documentation/components/DocumentationUploadPage';

export default function TruckPositionUploadPage() {
  return (
    <DocumentationUploadPage
      title="Truck Position Upload"
      uploadType="truck-positions"
      description="Upload truck position, driver, and location details from the standard Excel template."
    />
  );
}
