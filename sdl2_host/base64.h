#include <string>

std::string base64_encode(unsigned char const* , unsigned int len);
std::string base64_decode(std::string const& s);

unsigned char *base64_decode_bin(const char *data,
                             size_t input_length,
                             size_t *output_length);