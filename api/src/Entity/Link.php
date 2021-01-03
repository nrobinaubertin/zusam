<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use Nelmio\ApiDocBundle\Annotation\Model;
use OpenApi\Annotations as OA;

/**
 * @ORM\Table(name="`link`")
 * @ORM\Entity
 */
class Link
{
    /**
     * @ORM\Id
     * @ORM\Column(type="guid")
     * @Assert\NotBlank()
     * @OA\Property(type="guid")
     */
    private $id;

    /**
     * @ORM\Column(type="integer")
     * @Assert\Type("integer")
     * @Assert\NotNull()
     * @OA\Property(type="integer")
     */
    private $createdAt;

    /**
     * @ORM\Column(type="integer")
     * @Assert\Type("integer")
     * @Assert\NotNull()
     * @OA\Property(type="integer")
     */
    private $updatedAt;

    /**
     * @ORM\Column(type="json")
     * @Assert\NotBlank()
     * @OA\Property(type="object")
     */
    private $data;

    /**
     * @ORM\Column(type="string", unique=true)
     * @Assert\NotBlank()
     * @OA\Property(type="string")
     */
    private $url;

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\File")
     * @ORM\JoinColumn(name="preview_id", referencedColumnName="id")
     * @OA\Property(type="App\Entity\File")
     */
    private $preview;

    /**
     * @ORM\Column(type="guid", unique=true)
     * @Assert\NotBlank()
     * @OA\Property(type="guid")
     */
    private $secretKey;

    /**
     * @Groups("*")
     * @OA\Property(type="string")
     */
    private $entityType;

    public function getEntityType(): string
    {
        return strtolower((new \ReflectionClass($this))->getShortName());
    }

    public function __construct(string $url)
    {
        $this->id = Uuid::uuidv4($url);
        $this->url = $url;
        $this->createdAt = time();
        $this->updatedAt = time();
        $this->secretKey = Uuid::uuidv4();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getCreatedAt(): int
    {
        return $this->createdAt;
    }

    public function setCreatedAt(int $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getUpdatedAt(): int
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(int $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
    }

    public function getData(): array
    {
        return $this->data;
    }

    public function setData(array $data): void
    {
        $this->data = $data;
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function setUrl(string $url): void
    {
        $this->url = $url;
    }

    public function getPreview(): ?File
    {
        return $this->preview;
    }

    public function setPreview(File $preview): void
    {
        $this->preview = $preview;
    }

    public function getSecretKey(): string
    {
        return $this->secretKey;
    }

    public function resetSecretKey(): void
    {
        $this->secretKey = Uuid::uuidv4();
    }
}
