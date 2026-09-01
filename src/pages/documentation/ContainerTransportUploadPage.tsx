import { DocumentationUploadPage } from '@/features/documentation/components/DocumentationUploadPage';

export default function ContainerTransportUploadPage() {
  return (
    <DocumentationUploadPage
      title="Container Transport Upload"
      uploadType="container-transport"
      description="Upload container handling and driver charges from the standard Excel template."
    />
  );
}
