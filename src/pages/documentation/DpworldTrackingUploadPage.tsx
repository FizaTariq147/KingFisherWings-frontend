import { DocumentationUploadPage } from '@/features/documentation/components/DocumentationUploadPage';

export default function DpworldTrackingUploadPage() {
  return (
    <DocumentationUploadPage
      title="DP World Tracking file upload"
      uploadType="dpworld-tracking"
      description="Upload CSV or text tracking files to extract DP World tracking data."
    />
  );
}
