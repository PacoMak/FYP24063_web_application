class FileNotFoundException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)
        self.status_code = 404
