import json

from django.test import TestCase


class ApiDocumentationIntegrationTests(TestCase):
    def test_openapi_schema_is_available(self):
        response = self.client.get('/api/schema/', HTTP_ACCEPT='application/json')

        self.assertEqual(response.status_code, 200)
        schema = json.loads(response.content)
        self.assertIn('BearerAuth', schema['components']['securitySchemes'])

    def test_swagger_and_redoc_pages_are_available(self):
        swagger_response = self.client.get('/api/docs/')
        redoc_response = self.client.get('/api/redoc/')

        self.assertEqual(swagger_response.status_code, 200)
        self.assertEqual(redoc_response.status_code, 200)
