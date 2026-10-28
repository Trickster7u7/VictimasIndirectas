import re


PATRON_CURP = (
    r"^[A-Z][AEIOUX][A-Z]{2}"
    r"[0-9]{2}"
    r"(0[1-9]|1[0-2])"
    r"(0[1-9]|[12][0-9]|3[01])"
    r"[HM]"
    r"(AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|"
    r"JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|"
    r"TC|TS|TL|VZ|YN|ZS|NE)"
    r"[B-DF-HJ-NP-TV-Z]{3}"
    r"[0-9A-J]"
    r"[0-9]$"
)


def tiene_formato_curp_valido(curp: str | None) -> bool:
    """
    Comprueba unicamente el formato estructural de una CURP.
    """

    if not curp:
        return False

    return re.fullmatch(PATRON_CURP, curp) is not None