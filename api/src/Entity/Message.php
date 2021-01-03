<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Nelmio\ApiDocBundle\Annotation\Model;
use OpenApi\Annotations as OA;

/**
 * @ORM\Table(name="`message`")
 * @ORM\Entity
 */
class Message
{
    private $linkByUrl;

    /**
     * @ORM\Id
     * @ORM\Column(type="guid")
     * @Assert\NotBlank()
     * @Groups("*")
     * @OA\Property(type="guid")
     */
    private $id;

    /**
     * @ORM\Column(type="integer")
     * @Assert\Type("integer")
     * @Assert\NotNull()
     * @Groups({"read_message"})
     * @OA\Property(type="integer")
     */
    private $createdAt;

    /**
     * @ORM\Column(type="json", nullable=true)
     * @Assert\NotBlank()
     * @Groups({"read_message", "read_notification"})
     * @OA\Property(type="object")
     */
    private $data;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\User", inversedBy="messages")
     * @Groups("*")
     * @OA\Property(type="array", @OA\Items(type="App\Entity\User"))
     */
    private $author;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Group", inversedBy="messages")
     * @Groups({"read_message"})
     * @OA\Property(type="App\Entity\Group")
     */
    private $group;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Message", inversedBy="children")
     * @ORM\JoinColumn(name="parent_id", referencedColumnName="id")
     * @Groups({"read_message"})
     * @OA\Property(type="App\Entity\Message")
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Message"))
     */
    private $parent;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Message", mappedBy="parent")
     * @Groups({"read_message"})
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Message"))
     */
    private $children;

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\File")
     * @ORM\JoinTable(name="messages_files",
     *      joinColumns={@ORM\JoinColumn(name="message_id", referencedColumnName="id")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="file_id", referencedColumnName="id")}
     *      )
     * @Groups({"read_message"})
     * @OA\Property(type="array", @OA\Items(type="App\Entity\File"))
     */
    private $files;

    /**
     * @ORM\Column(type="integer")
     * @Assert\Type("integer")
     * @Assert\NotNull()
     * @Groups({"read_message"})
     * @OA\Property(type="integer")
     */
    private $lastActivityDate;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\File")
     * @ORM\JoinColumn(name="preview_id", referencedColumnName="id")
     * @Groups({"read_message"})
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
     * @ORM\Column(type="boolean")
     * @Assert\NotNull()
     * @Groups({"read_message"})
     * @OA\Property(type="boolean")
     */
    private $isInFront;

    /**
     * @Groups("*")
     * @OA\Property(type="string")
     */
    private $entityType;

    public function getEntityType(): string
    {
        return strtolower((new \ReflectionClass($this))->getShortName());
    }

    public function __construct()
    {
        $this->id = Uuid::uuidv4();
        $this->children = new ArrayCollection();
        $this->files = new ArrayCollection();
        $this->createdAt = time();
        $this->lastActivityDate = time();
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

    public function getData(): ?array
    {
        return $this->data;
    }

    public function setData(array $data): void
    {
        $this->data = $data;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(User $author): void
    {
        $this->author = $author;
    }

    public function getGroup(): Group
    {
        return $this->group;
    }

    public function setGroup(Group $group): void
    {
        $this->group = $group;
    }

    public function getParent(): ?Message
    {
        return $this->parent;
    }

    public function setParent(?Message $parent): void
    {
        $this->parent = $parent;
    }

    public function getChildren(): Collection
    {
        return $this->children;
    }

    public function addChild(Message $child): void
    {
        $this->children[] = $child;
    }

    public function removeChild(Message $child): void
    {
        $this->children->removeElement($child);
    }

    public function getFiles(): Collection
    {
        return $this->files;
    }

    public function setFiles(Collection $files): void
    {
        $this->files = $files;
    }

    public function addFile(File $file): void
    {
        $this->files[] = $file;
    }

    public function removeFile(File $file): void
    {
        $this->files->removeElement($file);
    }

    public function getLastActivityDate(): int
    {
        return $this->lastActivityDate;
    }

    public function setLastActivityDate(int $lastActivityDate): void
    {
        $this->lastActivityDate = $lastActivityDate;
    }

    public function getPreview(): ?File
    {
        return $this->preview;
    }

    public function setPreview(?File $preview): void
    {
        $this->preview = $preview;
    }

    public function getUrls(): array
    {
        $text = $this->getData()['text'];
        if (!empty($text)) {
            return self::getUrlsFromText($text);
        }

        return [];
    }

    public static function getUrlsFromText(string $text): array
    {
        preg_match("/(\([^()]*)?https?:\/\/[^[\]\n\r ]*[-A-Za-z0-9+&@#\/%=~_()|]/i", $text, $urls);

        return array_map(function ($url) {
            if (!empty($url) && '(' === substr($url, 0, 1)) {
                $url = substr($url, stripos($url, 'http'));
                if (')' === substr($url, -1)) {
                    $url = substr($url, 0, -1);
                }
            }

            return $url;
        }, $urls);
    }

    public function getSecretKey(): string
    {
        return $this->secretKey;
    }

    public function resetSecretKey(): void
    {
        $this->secretKey = Uuid::uuidv4();
    }

    public function getIsInFront(): bool
    {
        return $this->isInFront ?? false;
    }

    public function setIsInFront(bool $isInFront): void
    {
        $this->isInFront = $isInFront;
    }
}
