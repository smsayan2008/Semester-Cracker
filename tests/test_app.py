import unittest

from app import app


class AppRouteTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_homepage_loads(self):
        response = self.client.get('/dashboard')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Semester Cracker', response.get_data(as_text=True))

    def test_all_main_routes(self):
        for path in [
            '/', '/dashboard', '/tasks', '/notes', '/attendance', '/cgpa',
            '/planner', '/pomodoro', '/analytics', '/pdf-vault', '/settings', '/health'
        ]:
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertIn(response.status_code, (200, 404))

    def test_custom_error_pages(self):
        not_found = self.client.get('/missing-route')
        self.assertEqual(not_found.status_code, 404)
        forced_error = self.client.get('/__debug_500__')
        self.assertEqual(forced_error.status_code, 500)


if __name__ == '__main__':
    unittest.main()
